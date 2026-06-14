/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre sales report API for the sales reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');

const router = express.Router();

/**
 * @description
 *
 * GET /regions
 *
 * Fetches a list of distinct sales regions.
 *
 * Example:
 * fetch('/regions')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/regions', (req, res, next) => {
  try {
    mongo (async db => {
      const regions = await db.collection('sales').distinct('region');
      res.send(regions);
    }, next);
  } catch (err) {
    console.error('Error getting regions: ', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /regions/:region
 *
 * Fetches sales data for a specific region, grouped by salesperson.
 *
 * Example:
 * fetch('/regions/north')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/regions/:region', (req, res, next) => {
  try {
    mongo (async db => {
      const salesReportByRegion = await db.collection('sales').aggregate([
        { $match: { region: req.params.region } },
        {
          $group: {
            _id: '$salesperson',
            totalSales: { $sum: '$amount'}
          }
        },
        {
          $project: {
            _id: 0,
            salesperson: '$_id',
            totalSales: 1
          }
        },
        {
          $sort: { salesperson: 1 }
        }
      ]).toArray();
      res.send(salesReportByRegion);
    }, next);
  } catch (err) {
    console.error('Error getting sales data for region: ', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /by-customer-salesperson
 *
 * Fetches sales data grouped by customer and salesperson, including
 * the total sales amount and number of transactions for each
 * customer/salesperson pairing. Results are sorted alphabetically
 * by customer, then by salesperson.
 *
 */
router.get('/by-customer-salesperson', (req, res, next) => {
  try {
    mongo (async db => {
      const salesByCustomerSalesperson = await db.collection('sales').aggregate([
        {
          $group: {
            _id: {
              customer: '$customer',
              salesperson: '$salesperson'
            },
            totalSales: { $sum: '$amount' },
            transactionCount: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            customer: '$_id.customer',
            salesperson: '$_id.salesperson',
            totalSales: 1,
            transactionCount: 1
          }
        },
        {
          $sort: {
            customer: 1,
            salesperson: 1
          }
        }
      ]).toArray();

      res.send(salesByCustomerSalesperson);
    }, next);
  } catch (err) {
    console.error('Error getting sales data by customer and salesperson: ', err);
    next(err);
  }
});

module.exports = router;