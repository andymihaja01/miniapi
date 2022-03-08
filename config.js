module.exports = {
    DATABASE_URL: process.env.DATABASE_URL || "mongodb://localhost:27017/miniapi",
    FACTORY_URL: process.env.FACTORY_URL || "http://localhost:3001",
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || "dev",
    ACCESS_TOKEN_SECRET: process.env.NODE_ENV || '65241c7083662f9de62780e244fb04dab86560de2fc209cd43ce9a82a4ffdd9056ab371322a44dfea7d416c09d36d929ace34ebccb59c10573550ff7b26dd4bb',
    REFRESH_TOKEN_SECRET: process.env.NODE_ENV || '3ba3e98997487337e36979df367e8756e66e00a9a717a9963f6ae8ab6640e92687c5f9e066b262555d896f3a1530650d633e1e393df221d8bff2bc84599dd377'
  };
  