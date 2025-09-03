'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { profileAPI } from '@/lib/api';

const PasswordChange = () => {
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [validation, setValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate password strength
    if (name === 'newPassword') {
      setValidation({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        match: value === formData.confirmPassword
      });
    }

    // Check password match
    if (name === 'confirmPassword') {
      setValidation(prev => ({
        ...prev,
        match: value === formData.newPassword
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (!Object.values(validation).every(Boolean)) {
      toast.error('Please ensure your password meets all requirements');
      return;
    }

    setLoading(true);

    try {
      const { data } = await profileAPI.updatePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      if (data?.success) {
        toast.success('Password updated successfully!');
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setValidation({
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
          match: false
        });
      } else {
        toast.error(data?.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const getValidationIcon = (isValid) => {
    return isValid ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-gray-400" />
    );
  };

  const getValidationColor = (isValid) => {
    return isValid ? 'text-green-600' : 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-600">Update your account password</p>
        </div>
      </div>

      <div className="max-w-md">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Lock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Password Security</h3>
              <p className="text-sm text-gray-600">Keep your account secure with a strong password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  name="oldPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {formData.newPassword && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Password Requirements</h4>
                <div className="space-y-2">
                  <div className={`flex items-center space-x-2 text-sm ${getValidationColor(validation.length)}`}>
                    {getValidationIcon(validation.length)}
                    <span>At least 8 characters long</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-sm ${getValidationColor(validation.uppercase)}`}>
                    {getValidationIcon(validation.uppercase)}
                    <span>Contains uppercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-sm ${getValidationColor(validation.lowercase)}`}>
                    {getValidationIcon(validation.lowercase)}
                    <span>Contains lowercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-sm ${getValidationColor(validation.number)}`}>
                    {getValidationIcon(validation.number)}
                    <span>Contains number</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-sm ${getValidationColor(validation.special)}`}>
                    {getValidationIcon(validation.special)}
                    <span>Contains special character</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-sm ${getValidationColor(validation.match)}`}>
                    {getValidationIcon(validation.match)}
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tips */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Security Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use a unique password for each account</li>
                <li>• Avoid using personal information</li>
                <li>• Consider using a password manager</li>
                <li>• Enable two-factor authentication if available</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !Object.values(validation).every(Boolean)}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PasswordChange;
