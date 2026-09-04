import React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';

export const DashboardLayoutOutlet = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};
