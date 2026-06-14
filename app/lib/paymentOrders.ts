import { cafeConfig } from "./cafeConfig";
import { getFirebaseAdminDb, isFirebaseAdminConfigured } from "./firebaseAdmin";
import type { KitchenOrder } from "./orders";

export type StripePaidSession = {
  id?: string;
  amount_total?: number;
  payment_status?: string;
  client_reference_id?: string;
  metadata?: Record<string, string>;
};

type PendingOrder = KitchenOrder & {
  payment: {
    provider: "stripe";
    status: "pending" | "paid" | "failed";
    checkoutSessionId?: string;
    createdAt: number;
    paidAt?: number;
    amountPaid?: number;
  };
};

function stateCollectionName() {
  return process.env.NEXT_PUBLIC_FIREBASE_STATE_COLLECTION || "cafes";
}

function getCafeStateRef() {
  const db = getFirebaseAdminDb();
  if (!db) return null;
  return db.collection(stateCollectionName()).doc(cafeConfig.id);
}

function findPendingOrder(pendingOrders: Record<string, PendingOrder>, orderId?: string, sessionId?: string) {
  if (orderId && pendingOrders[orderId]) return { key: orderId, order: pendingOrders[orderId] };
  const match = Object.entries(pendingOrders).find(([, order]) => order.payment?.checkoutSessionId && order.payment.checkoutSessionId === sessionId);
  return match ? { key: match[0], order: match[1] } : null;
}

function findExistingPaidOrder(orders: KitchenOrder[], orderId?: string, sessionId?: string) {
  return orders.find((order) => {
    const sameOrderId = orderId && String(order.id) === String(orderId);
    const sameSessionId = sessionId && order.payment?.checkoutSessionId === sessionId;
    return Boolean(sameOrderId || sameSessionId);
  });
}

export function isProductionPaymentStoreConfigured() {
  return isFirebaseAdminConfigured();
}

export async function savePendingStripeOrder(order: KitchenOrder) {
  const stateRef = getCafeStateRef();
  if (!stateRef) throw new Error("Firebase Admin is not configured.");

  const pendingOrder: PendingOrder = {
    ...order,
    payment: {
      provider: "stripe",
      status: "pending",
      createdAt: Date.now(),
    },
  };

  await stateRef.set({
    cafeId: cafeConfig.id,
    pendingOrders: {
      [String(order.id)]: pendingOrder,
    },
    updatedAt: Date.now(),
  }, { merge: true });

  return pendingOrder;
}

export async function attachStripeSessionToPendingOrder(orderId: number, checkoutSessionId: string) {
  const stateRef = getCafeStateRef();
  if (!stateRef) throw new Error("Firebase Admin is not configured.");

  await stateRef.firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(stateRef);
    const data = snapshot.data() || {};
    const pendingOrders = { ...(data.pendingOrders || {}) } as Record<string, PendingOrder>;
    const pendingOrder = pendingOrders[String(orderId)];

    if (!pendingOrder) throw new Error("Pending Stripe order was not found before checkout session attach.");

    transaction.set(stateRef, {
      cafeId: cafeConfig.id,
      pendingOrders: {
        [String(orderId)]: {
          ...pendingOrder,
          payment: {
            ...pendingOrder.payment,
            checkoutSessionId,
          },
        },
      },
      updatedAt: Date.now(),
    }, { merge: true });
  });
}

export async function confirmPaidStripeOrder(session: StripePaidSession) {
  const stateRef = getCafeStateRef();
  if (!stateRef) throw new Error("Firebase Admin is not configured.");

  const orderId = session.metadata?.orderId || session.client_reference_id;
  const sessionCafeId = session.metadata?.cafeId;

  if (!orderId && !session.id) throw new Error("Stripe session is missing order identifiers.");
  if (sessionCafeId !== cafeConfig.id) throw new Error("Stripe session cafeId does not match this deployment.");
  if (session.payment_status !== "paid") throw new Error("Stripe session is not paid.");

  await stateRef.firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(stateRef);
    const data = snapshot.data() || {};
    const pendingOrders = { ...(data.pendingOrders || {}) } as Record<string, PendingOrder>;
    const existingOrders = Array.isArray(data.orders) ? data.orders as KitchenOrder[] : [];
    const alreadyPaidOrder = findExistingPaidOrder(existingOrders, orderId, session.id);

    if (alreadyPaidOrder) return;

    const match = findPendingOrder(pendingOrders, orderId, session.id);
    if (!match) throw new Error("Paid Stripe order was not found in pendingOrders.");

    const pendingOrder = match.order;
    const expectedTotal = Math.round(Number(pendingOrder.total) * 100);
    if (typeof session.amount_total === "number" && session.amount_total !== expectedTotal) {
      throw new Error("Paid amount does not match the server-calculated order total.");
    }

    const paidOrder: KitchenOrder = {
      ...pendingOrder,
      payment: {
        provider: "stripe",
        status: "paid",
        checkoutSessionId: session.id,
        paidAt: Date.now(),
        amountPaid: typeof session.amount_total === "number" ? session.amount_total / 100 : pendingOrder.total,
      },
    };

    delete pendingOrders[match.key];

    transaction.set(stateRef, {
      cafeId: cafeConfig.id,
      orders: [paidOrder, ...existingOrders],
      pendingOrders,
      updatedAt: Date.now(),
    }, { merge: true });
  });
}
