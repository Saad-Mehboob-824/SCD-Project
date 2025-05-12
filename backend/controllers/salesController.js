const Purchase = require("../models/purchase");
const mongoose = require("mongoose");

exports.generateSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    // Build query to filter purchases for the specific seller
    const query = {
      seller: req.seller._id,
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Aggregation pipeline for sales report
    const report = await Purchase.aggregate([
      { $match: query },
      {
        $group: {
          _id:
            groupBy === "month"
              ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
              : "$book",
          totalRevenue: { $sum: "$price" },
          totalQuantity: { $sum: "$quantity" },
          uniqueBooks: { $addToSet: "$book" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Add additional metadata
    const metadata = {
      totalSales: report.reduce((sum, item) => sum + item.totalRevenue, 0),
      totalBooksSold: report.reduce((sum, item) => sum + item.totalQuantity, 0),
      reportPeriod: {
        start: startDate ? new Date(startDate) : null,
        end: endDate ? new Date(endDate) : null,
      },
    };

    res.json({
      report,
      metadata,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTopSellingBooks = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const topBooks = await Purchase.aggregate([
      { $match: { seller: req.seller._id } },
      {
        $group: {
          _id: "$book",
          totalSales: { $sum: "$price" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: "books", // Assumes your Book model is named 'books' in MongoDB
          localField: "_id",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      { $unwind: "$bookDetails" },
    ]);

    res.json(topBooks);
  } catch (error) {
    next(error);
  }
};
