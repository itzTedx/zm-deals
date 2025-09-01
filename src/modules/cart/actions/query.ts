import { headers } from "next/headers";

import { and, eq } from "drizzle-orm";

import { auth, getSession } from "@/lib/auth/server";
import { getOrCreateSessionId } from "@/lib/auth/session";
import { db } from "@/server/db";
import { carts } from "@/server/schema";

export async function getCart() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      // Handle guest cart
      const sessionId = await getOrCreateSessionId();

      const guestCart = await db.query.carts.findFirst({
        where: and(eq(carts.sessionId, sessionId), eq(carts.isActive, true)),
        with: {
          items: {
            with: {
              product: {
                with: {
                  meta: true,
                  inventory: true,
                  images: {
                    with: {
                      media: true,
                    },
                  },
                },
              },
              comboDeal: {
                with: {
                  products: {
                    with: {
                      product: {
                        with: {
                          images: {
                            with: {
                              media: true,
                            },
                          },
                          inventory: true,
                        },
                      },
                    },
                  },
                  images: {
                    with: {
                      media: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!guestCart || !guestCart.items) {
        return [];
      }

      return guestCart.items.map((item) => ({
        id: item.id,
        product: item.product,
        comboDeal: item.comboDeal,
        quantity: item.quantity,
        itemType: item.itemType,
      }));
    }

    // Handle authenticated user cart
    const userCart = await db.query.carts.findFirst({
      where: and(eq(carts.userId, session.user.id), eq(carts.isActive, true)),
      with: {
        items: {
          with: {
            product: {
              with: {
                meta: true,
                inventory: true,
                images: {
                  with: {
                    media: true,
                  },
                },
              },
            },
            comboDeal: {
              with: {
                products: {
                  with: {
                    product: {
                      with: {
                        images: {
                          with: {
                            media: true,
                          },
                        },
                        inventory: true,
                      },
                    },
                  },
                },
                images: {
                  with: {
                    media: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userCart || !userCart.items) {
      return [];
    }

    return userCart.items.map((item) => ({
      id: item.id,
      product: item.product,
      comboDeal: item.comboDeal,
      quantity: item.quantity,
      itemType: item.itemType,
    }));
  } catch (error) {
    console.error("Error getting cart:", error);
    return [];
  }
}

export async function getCartItemCount() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      // Handle guest cart
      const sessionId = await getOrCreateSessionId();

      const guestCart = await db.query.carts.findFirst({
        where: and(eq(carts.sessionId, sessionId), eq(carts.isActive, true)),
        with: {
          items: true,
        },
      });

      if (!guestCart || !guestCart.items) {
        return 0;
      }

      return guestCart.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Handle authenticated user cart
    const userCart = await db.query.carts.findFirst({
      where: and(eq(carts.userId, session.user.id), eq(carts.isActive, true)),
      with: {
        items: true,
      },
    });

    if (!userCart || !userCart.items) {
      return 0;
    }

    return userCart.items.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error("Error getting cart item count:", error);
    return 0;
  }
}

export async function getCartTotal() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      // Handle guest cart
      const sessionId = await getOrCreateSessionId();

      const guestCart = await db.query.carts.findFirst({
        where: and(eq(carts.sessionId, sessionId), eq(carts.isActive, true)),
        with: {
          items: {
            with: {
              product: true,
            },
          },
        },
      });

      if (!guestCart || !guestCart.items) {
        return 0;
      }

      return guestCart.items.reduce((total, item) => {
        const price = Number(item.product?.price);
        return total + price * item.quantity;
      }, 0);
    }

    // Handle authenticated user cart
    const userCart = await db.query.carts.findFirst({
      where: and(eq(carts.userId, session.user.id), eq(carts.isActive, true)),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!userCart || !userCart.items) {
      return 0;
    }

    return userCart.items.reduce((total, item) => {
      const price = Number(item.product?.price);
      return total + price * item.quantity;
    }, 0);
  } catch (error) {
    console.error("Error getting cart total:", error);
    return 0;
  }
}

// New function to get cart data for components that need both cart items and totals
export async function getCartData() {
  try {
    const session = await getSession();

    if (!session) {
      // Handle guest cart
      const sessionId = await getOrCreateSessionId();

      const guestCart = await db.query.carts.findFirst({
        where: and(eq(carts.sessionId, sessionId), eq(carts.isActive, true)),
        with: {
          items: {
            with: {
              product: {
                with: {
                  inventory: true,
                  images: {
                    with: {
                      media: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!guestCart || !guestCart.items) {
        return {
          items: [],
          itemCount: 0,
          total: 0,
        };
      }

      const items = guestCart.items.map((item) => ({
        id: item.id,
        product: item.product,
        quantity: item.quantity,
      }));

      const itemCount = guestCart.items.reduce((total, item) => total + item.quantity, 0);
      const total = guestCart.items.reduce((total, item) => {
        const price = Number(item.product?.price);
        return total + price * item.quantity;
      }, 0);

      return {
        items,
        itemCount,
        total,
      };
    }

    // Handle authenticated user cart
    const userCart = await db.query.carts.findFirst({
      where: and(eq(carts.userId, session.user.id), eq(carts.isActive, true)),
      with: {
        items: {
          with: {
            product: {
              with: {
                meta: true,
                inventory: true,
                images: {
                  with: {
                    media: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userCart || !userCart.items) {
      return {
        items: [],
        itemCount: 0,
        total: 0,
      };
    }

    const items = userCart.items.map((item) => ({
      id: item.id,
      product: item.product,
      quantity: item.quantity,
    }));

    const itemCount = userCart.items.reduce((total, item) => total + item.quantity, 0);
    const total = userCart.items.reduce((total, item) => {
      const price = Number(item.product?.price);
      return total + price * item.quantity;
    }, 0);

    return {
      items,
      itemCount,
      total,
    };
  } catch (error) {
    console.error("Error getting cart data:", error);
    return {
      items: [],
      itemCount: 0,
      total: 0,
    };
  }
}
