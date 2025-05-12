const jwt = require("jsonwebtoken");
const Seller = require("../models/seller");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const seller = await Seller.findOne({
      _id: decoded.id,
      "tokens.token": token,
    });

    if (!seller) {
      throw new Error();
    }

    req.token = token;
    req.seller = seller;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

module.exports = authMiddleware;
