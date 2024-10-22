
export const whitelistMiddleware = (req: any, res: any, next: any) => {
  const validIps = ["::12", "127.0.0.1"]; // Put your IP whitelist in this array
  if (validIps.includes(req.connection.remoteAddress)) {
    next();
  } else {
    const err = new Error("Invalid IP: " + req.connection.remoteAddress);
    next(err);
  }
};
