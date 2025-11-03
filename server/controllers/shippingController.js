const ShippingRule = require("../models/ShippingRule");
const ErrorHandler = require("../utils/errorHandler");

// Get shipping charges for a pincode => /api/v1/shipping/calculate
exports.calculateShipping = async (req, res, next) => {
  try {
    const { pincode, orderAmount } = req.body;

    if (!pincode || !orderAmount) {
      return next(
        new ErrorHandler("Pincode and order amount are required", 400)
      );
    }

    // Validate pincode format
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      return next(new ErrorHandler("Please enter a valid pincode", 400));
    }

    // Find applicable shipping rules
    const shippingRules = await ShippingRule.find({ isActive: true }).sort({
      priority: 1,
    });

    let applicableRule = null;
    let shippingCharges = 0;
    let estimatedDelivery = { min: 3, max: 5 };

    // Check for specific pincode rules first
    for (const rule of shippingRules) {
      if (rule.matchesPincode(pincode)) {
        applicableRule = rule;
        shippingCharges = rule.getShippingCharges(orderAmount);
        estimatedDelivery = rule.estimatedDeliveryDays;
        break;
      }
    }

  // If no specific rule found, use default rule; otherwise fall back to base policy
  if (!applicableRule) {
    const defaultRule = shippingRules.find(
      (rule) => rule.pincodeType === "all"
    );
    if (defaultRule) {
      applicableRule = defaultRule;
      shippingCharges = defaultRule.getShippingCharges(orderAmount);
      estimatedDelivery = defaultRule.estimatedDeliveryDays;
    } else {
      shippingCharges = orderAmount >= 1000 ? 0 : 50;
      estimatedDelivery = { min: 3, max: 5 };
    }
  }

    // Calculate delivery dates
    const currentDate = new Date();
    const minDeliveryDate = new Date(
      currentDate.getTime() + estimatedDelivery.min * 24 * 60 * 60 * 1000
    );
    const maxDeliveryDate = new Date(
      currentDate.getTime() + estimatedDelivery.max * 24 * 60 * 60 * 1000
    );

    res.status(200).json({
      success: true,
      shipping: {
        pincode,
        orderAmount,
        shippingCharges,
        freeShippingThreshold: applicableRule?.freeShippingThreshold || 1000,
        estimatedDelivery: {
          min: estimatedDelivery.min,
          max: estimatedDelivery.max,
          minDate: minDeliveryDate.toISOString().split("T")[0],
          maxDate: maxDeliveryDate.toISOString().split("T")[0],
        },
        rule: applicableRule
          ? {
              name: applicableRule.name,
              description: applicableRule.description,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get shipping rules - Admin => /api/v1/admin/shipping/rules
exports.getShippingRules = async (req, res, next) => {
  try {
    const shippingRules = await ShippingRule.find().sort({ priority: 1 });

    res.status(200).json({
      success: true,
      shippingRules,
    });
  } catch (error) {
    next(error);
  }
};

// Create shipping rule - Admin => /api/v1/admin/shipping/rule/new
exports.createShippingRule = async (req, res, next) => {
  try {
    const shippingRule = await ShippingRule.create(req.body);

    res.status(201).json({
      success: true,
      shippingRule,
    });
  } catch (error) {
    next(error);
  }
};

// Update shipping rule - Admin => /api/v1/admin/shipping/rule/:id
exports.updateShippingRule = async (req, res, next) => {
  try {
    let shippingRule = await ShippingRule.findById(req.params.id);

    if (!shippingRule) {
      return next(new ErrorHandler("Shipping rule not found", 404));
    }

    shippingRule = await ShippingRule.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(200).json({
      success: true,
      shippingRule,
    });
  } catch (error) {
    next(error);
  }
};

// Delete shipping rule - Admin => /api/v1/admin/shipping/rule/:id
exports.deleteShippingRule = async (req, res, next) => {
  try {
    const shippingRule = await ShippingRule.findById(req.params.id);

    if (!shippingRule) {
      return next(new ErrorHandler("Shipping rule not found", 404));
    }

    await shippingRule.deleteOne();

    res.status(200).json({
      success: true,
      message: "Shipping rule deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get shipping rule details - Admin => /api/v1/admin/shipping/rule/:id
exports.getShippingRule = async (req, res, next) => {
  try {
    const shippingRule = await ShippingRule.findById(req.params.id);

    if (!shippingRule) {
      return next(new ErrorHandler("Shipping rule not found", 404));
    }

    res.status(200).json({
      success: true,
      shippingRule,
    });
  } catch (error) {
    next(error);
  }
};

// Bulk create shipping rules - Admin => /api/v1/admin/shipping/rules/bulk
exports.bulkCreateShippingRules = async (req, res, next) => {
  try {
    const { rules } = req.body;

    if (!Array.isArray(rules) || rules.length === 0) {
      return next(
        new ErrorHandler("Please provide an array of shipping rules", 400)
      );
    }

    const createdRules = await ShippingRule.insertMany(rules);

    res.status(201).json({
      success: true,
      message: `${createdRules.length} shipping rules created successfully`,
      shippingRules: createdRules,
    });
  } catch (error) {
    next(error);
  }
};

// Test pincode against rules - Admin => /api/v1/admin/shipping/test-pincode
exports.testPincode = async (req, res, next) => {
  try {
    const { pincode } = req.body;

    if (!pincode) {
      return next(new ErrorHandler("Pincode is required", 400));
    }

    const shippingRules = await ShippingRule.find({ isActive: true }).sort({
      priority: 1,
    });

    const matchingRules = [];

    for (const rule of shippingRules) {
      if (rule.matchesPincode(pincode)) {
        matchingRules.push({
          id: rule._id,
          name: rule.name,
          description: rule.description,
          shippingCharges: rule.shippingCharges,
          freeShippingThreshold: rule.freeShippingThreshold,
          estimatedDeliveryDays: rule.estimatedDeliveryDays,
          priority: rule.priority,
        });
      }
    }

    res.status(200).json({
      success: true,
      pincode,
      matchingRules,
      totalRules: shippingRules.length,
      matchedRules: matchingRules.length,
    });
  } catch (error) {
    next(error);
  }
};
