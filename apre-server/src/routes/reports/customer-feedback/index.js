/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre customer feedback API for the customer feedback reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');

const router = express.Router();

/**
 * @description
 *
 * GET /channel-rating-by-month
 *
 * Fetches average customer feedback ratings by channel for a specified month.
 *
 * Example:
 * fetch('/channel-rating-by-month?month=1')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/channel-rating-by-month', (req, res, next) => {
  try {
    const { month } = req.query;

    if (!month) {
      return next(createError(400, 'month and channel are required'));
    }

    mongo (async db => {
      const data = await db.collection('customerFeedback').aggregate([
        {
          $addFields: {
            date: { $toDate: '$date' }
          }
        },
        {
          $group: {
            _id: {
              channel: "$channel",
              month: { $month: "$date" },
            },
            ratingAvg: { $avg: '$rating'}
          }
        },
        {
          $match: {
            '_id.month': Number(month)
          }
        },
        {
          $group: {
            _id: '$_id.channel',
            ratingAvg: { $push: '$ratingAvg' }
          }
        },
        {
          $project: {
            _id: 0,
            channel: '$_id',
            ratingAvg: 1
          }
        },
        {
          $group: {
            _id: null,
            channels: { $push: '$channel' },
            ratingAvg: { $push: '$ratingAvg' }
          }
        },
        {
          $project: {
            _id: 0,
            channels: 1,
            ratingAvg: 1
          }
        }
      ]).toArray();

      res.send(data);
    }, next);

  } catch (err) {
    console.error('Error in /rating-by-date-range-and-channel', err);
    next(err);
  }
});


/**
 * @description
 *
 * GET /distinct-years
 *
 * Fetches a sorted list of distinct years present in the customerFeedback
 * collection. Used by the customer-feedback-by-year component to populate
 * its year dropdown on init.
 *
 * Example:
 * fetch('/distinct-years')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/distinct-years', (req, res, next) => {
  try {
    mongo(async db => {
      const data = await db.collection('customerFeedback').aggregate([
        {
          $addFields: {
            date: { $toDate: '$date' }
          }
        },
        {
          $group: {
            _id: { $year: '$date' }
          }
        },
        {
          $project: {
            _id: 0,
            year: '$_id'
          }
        },
        {
          $sort: { year: 1 }
        }
      ]).toArray();

      res.send(data);
    }, next);
  } catch (err) {
    console.error('Error in /distinct-years', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /customer-feedback-by-year
 *
 * Fetches average customer feedback ratings grouped by channel for a
 * specified year. Returns parallel arrays of channel names and rating averages.
 *
 * Example:
 * fetch('/customer-feedback-by-year?year=2023')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/customer-feedback-by-year', (req, res, next) => {
  try {
    const { year } = req.query;

    if (!year) {
      return next(createError(400, 'year is required'));
    }

    mongo(async db => {
      const data = await db.collection('customerFeedback').aggregate([
        {
          $addFields: {
            date: { $toDate: '$date' }
          }
        },
        {
          $match: {
            $expr: { $eq: [{ $year: '$date' }, Number(year)] }
          }
        },
        {
          $group: {
            _id: {
              channel: '$channel',
              year: { $year: '$date' }
            },
            ratingAvg: { $avg: '$rating' }
          }
        },
        {
          $group: {
            _id: '$_id.channel',
            ratingAvg: { $push: '$ratingAvg' }
          }
        },
        {
          $project: {
            _id: 0,
            channel: '$_id',
            ratingAvg: 1
          }
        },
        {
          $group: {
            _id: null,
            channels: { $push: '$channel' },
            ratingAvg: { $push: '$ratingAvg' }
          }
        },
        {
          $project: {
            _id: 0,
            channels: 1,
            ratingAvg: 1
          }
        }
      ]).toArray();

      res.send(data);
    }, next);
  } catch (err) {
    console.error('Error in /customer-feedback-by-year', err);
    next(err);
  }
});

module.exports = router;