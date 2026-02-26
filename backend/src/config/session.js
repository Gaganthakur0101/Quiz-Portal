const session = require("express-session");
const MongoStore = require("connect-mongo");

module.exports = session({
  secret: process.env.SESSION_SECRET || "secret-key",
  resave: false,
  saveUninitialized: false,

  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    dbName: "projectSessions",
    collectionName: "sessions",
    ttl: 60 * 60 * 24, // 1 day
    autoRemove: "native",
  }),

  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false,      
    sameSite: "lax",    
    path: "/",          
  },
});
