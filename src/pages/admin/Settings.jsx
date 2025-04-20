import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { getSettings, updateSettings } from '../../services/adminApi';

const validationSchema = Yup.object({
  general: Yup.object({
    siteName: Yup.string().required('Site name is required'),
    siteDescription: Yup.string().required('Site description is required'),
    contactEmail: Yup.string()
      .email('Invalid email address')
      .required('Contact email is required'),
    phoneNumber: Yup.string().required('Phone number is required'),
    address: Yup.string().required('Address is required'),
    enableRegistration: Yup.boolean(),
    enableGuestCheckout: Yup.boolean(),
  }),
  email: Yup.object({
    smtpHost: Yup.string().required('SMTP host is required'),
    smtpPort: Yup.number()
      .required('SMTP port is required')
      .positive('Port must be positive')
      .integer('Port must be an integer'),
    smtpUsername: Yup.string().required('SMTP username is required'),
    smtpPassword: Yup.string().required('SMTP password is required'),
    fromEmail: Yup.string()
      .email('Invalid email address')
      .required('From email is required'),
    fromName: Yup.string().required('From name is required'),
    enableEmailNotifications: Yup.boolean(),
  }),
});

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    general: {
      siteName: '',
      siteDescription: '',
      contactEmail: '',
      phoneNumber: '',
      address: '',
      enableRegistration: true,
      enableGuestCheckout: true,
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: '',
      enableEmailNotifications: true,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      
      // Check if it's an authentication error
      if (error.response && error.response.status === 401) {
        toast.error('Authentication error. Please log in again.');
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else {
        toast.error(`Failed to fetch settings: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await updateSettings(values);
      setSettings(values);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      
      // Check if it's an authentication error
      if (error.response && error.response.status === 401) {
        toast.error('Authentication error. Please log in again.');
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else {
        toast.error(`Failed to update settings: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Formik
        initialValues={settings}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <Grid container spacing={3}>
              {/* General Settings */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    General Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="general.siteName"
                        label="Site Name"
                        value={values.general.siteName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.general?.siteName &&
                          Boolean(errors.general?.siteName)
                        }
                        helperText={
                          touched.general?.siteName &&
                          errors.general?.siteName
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="general.siteDescription"
                        label="Site Description"
                        value={values.general.siteDescription}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.general?.siteDescription &&
                          Boolean(errors.general?.siteDescription)
                        }
                        helperText={
                          touched.general?.siteDescription &&
                          errors.general?.siteDescription
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="general.contactEmail"
                        label="Contact Email"
                        type="email"
                        value={values.general.contactEmail}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.general?.contactEmail &&
                          Boolean(errors.general?.contactEmail)
                        }
                        helperText={
                          touched.general?.contactEmail &&
                          errors.general?.contactEmail
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="general.phoneNumber"
                        label="Phone Number"
                        value={values.general.phoneNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.general?.phoneNumber &&
                          Boolean(errors.general?.phoneNumber)
                        }
                        helperText={
                          touched.general?.phoneNumber &&
                          errors.general?.phoneNumber
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="general.address"
                        label="Address"
                        multiline
                        rows={2}
                        value={values.general.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.general?.address &&
                          Boolean(errors.general?.address)
                        }
                        helperText={
                          touched.general?.address && errors.general?.address
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            name="general.enableRegistration"
                            checked={values.general.enableRegistration}
                            onChange={handleChange}
                          />
                        }
                        label="Enable User Registration"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            name="general.enableGuestCheckout"
                            checked={values.general.enableGuestCheckout}
                            onChange={handleChange}
                          />
                        }
                        label="Enable Guest Checkout"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Email Settings */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Email Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="email.smtpHost"
                        label="SMTP Host"
                        value={values.email.smtpHost}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.email?.smtpHost &&
                          Boolean(errors.email?.smtpHost)
                        }
                        helperText={
                          touched.email?.smtpHost && errors.email?.smtpHost
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="email.smtpPort"
                        label="SMTP Port"
                        type="number"
                        value={values.email.smtpPort}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.email?.smtpPort &&
                          Boolean(errors.email?.smtpPort)
                        }
                        helperText={
                          touched.email?.smtpPort && errors.email?.smtpPort
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="email.smtpUsername"
                        label="SMTP Username"
                        value={values.email.smtpUsername}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.email?.smtpUsername &&
                          Boolean(errors.email?.smtpUsername)
                        }
                        helperText={
                          touched.email?.smtpUsername &&
                          errors.email?.smtpUsername
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="email.smtpPassword"
                        label="SMTP Password"
                        type="password"
                        value={values.email.smtpPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.email?.smtpPassword &&
                          Boolean(errors.email?.smtpPassword)
                        }
                        helperText={
                          touched.email?.smtpPassword &&
                          errors.email?.smtpPassword
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="email.fromEmail"
                        label="From Email"
                        type="email"
                        value={values.email.fromEmail}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.email?.fromEmail &&
                          Boolean(errors.email?.fromEmail)
                        }
                        helperText={
                          touched.email?.fromEmail && errors.email?.fromEmail
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="email.fromName"
                        label="From Name"
                        value={values.email.fromName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.email?.fromName &&
                          Boolean(errors.email?.fromName)
                        }
                        helperText={
                          touched.email?.fromName && errors.email?.fromName
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            name="email.enableEmailNotifications"
                            checked={values.email.enableEmailNotifications}
                            onChange={handleChange}
                          />
                        }
                        label="Enable Email Notifications"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    Save Settings
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default Settings; 