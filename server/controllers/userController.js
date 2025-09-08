const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");

// Get all users - Admin => /api/v1/admin/users
exports.allUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Get user details - Admin => /api/v1/admin/user/:id
exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile - Admin => /api/v1/admin/user/:id
exports.updateUser = async (req, res, next) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
      isEmailVerified: req.body.isEmailVerified,
    };

    // Remove undefined fields
    Object.keys(newUserData).forEach((key) => {
      if (newUserData[key] === undefined) {
        delete newUserData[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user - Admin => /api/v1/admin/user/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Add address => /api/v1/address/add
exports.addAddress = async (req, res, next) => {
  try {
    let { name, phone, address, city, state, pincode, isDefault } = req.body;

    const user = await User.findById(req.user.id);

    if (user.addresses.length === 0) {
      isDefault = true;
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      name,
      phone,
      address,
      city,
      state,
      pincode,
      isDefault,
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(200).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// Get user addresses => /api/v1/addresses
exports.getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// Update address => /api/v1/address/:id
exports.updateAddress = async (req, res, next) => {
  try {
    const { name, phone, address, city, state, pincode, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === req.params.id
    );

    if (addressIndex === -1) {
      return next(new ErrorHandler("Address not found", 404));
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses[addressIndex] = {
      name,
      phone,
      address,
      city,
      state,
      pincode,
      isDefault,
    };

    await user.save();

    res.status(200).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// Delete address => /api/v1/address/:id
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === req.params.id
    );

    if (addressIndex === -1) {
      return next(new ErrorHandler("Address not found", 404));
    }

    const deletedAddress = user.addresses[addressIndex];

    user.addresses.splice(addressIndex, 1);

    if (deletedAddress.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// Set default address => /api/v1/address/:id/default
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === req.params.id
    );

    if (addressIndex === -1) {
      return next(new ErrorHandler("Address not found", 404));
    }

    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });

    user.addresses[addressIndex].isDefault = true;

    await user.save();

    res.status(200).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// Get user statistics - Admin => /api/v1/admin/users/stats
exports.getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt");

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        newUsersThisMonth,
        usersByRole,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};
