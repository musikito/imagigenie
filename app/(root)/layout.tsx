import React from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className='root'>{children}</main>
  );
};

export default Layout;