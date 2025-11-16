const backapi = "http://localhost:5001";

const Allapi = {
  auth: {
    register: {
      url: `${backapi}/api/auth/register`,
      method: "POST",
    },
    login: {
      url: `${backapi}/api/auth/login`,
      method: "POST",
    },
    google: {
      url: `${backapi}/api/auth/google`,
      method: "POST",
    },
  },

  user: {
  update: {
    url: `${backapi}/api/user/update`,
    method: "PUT",
  }
},

  // Address routes
  address: {
    create: {
      url: `${backapi}/api/address`,
      method: "POST",
    },
    update: {
      url: (id) => `${backapi}/api/address/${id}`,
      method: "PUT",
    },
    delete: {
      url: (id) => `${backapi}/api/address/${id}`,
      method: "DELETE",
    },
    myaddresses: {
      url: `${backapi}/api/address/myaddresses`,
      method: "GET",
    },
  },

  // Product routes
  products: {
    create: {
      url: `${backapi}/api/products`,
      method: "POST",
    },
    update: {
      url: (id) => `${backapi}/api/products/${id}`,
      method: "PUT",
    },
    delete: {
      url: (id) => `${backapi}/api/products/${id}`,
      method: "DELETE",
    },
    getAll: {
      url: `${backapi}/api/products`,
      method: "GET",
    },
  },

  // Order routes
  orders: {
    create: {
      url: `${backapi}/api/orders`,
      method: "POST",
    },
    uploadScreenshots: {
      url: (id) => `${backapi}/api/orders/${id}/upload`,
      method: "PUT",
    },
    cancel: {
      url: (id) => `${backapi}/api/orders/${id}/cancel`,
      method: "PUT",
    },
    getMyOrders: {
      url: `${backapi}/api/orders/myorders`,
      method: "GET",
    },
    getAll: {
      url: `${backapi}/api/orders`,
      method: "GET",
    },
  },

  // Banner routes
  banners: {
    create: {
      url: `${backapi}/api/banners`,
      method: "POST",
    },
    update: {
      url: (id) => `${backapi}/api/banners/${id}`,
      method: "PUT",
    },
    delete: {
      url: (id) => `${backapi}/api/banners/${id}`,
      method: "DELETE",
    },
    getAll: {
      url: `${backapi}/api/banners`,
      method: "GET",
    },
  },
};

export default Allapi;
