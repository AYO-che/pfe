import React, { useState } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import Dashboard from '../components/admin/Dashboard'
import Clients  from '../components/admin/Clients'
import Nutritionists from '../components/admin/Nutritionists'
import Inquiries from '../components/admin/Inquiries'
import Content from '../components/admin/Content'
import Subscriptions from '../components/admin/Subscriptions'
import Settings  from '../components/admin/Settings'
import Comminity from '../components/admin/comminity'
import OffersManagement from '../components/admin/Offersmanagement'
import { useAuth } from '../contexts/AuthContext'

const PAGE_NAMES = {
dashboard:  'Dashboard',
clients: 'Client',
nutritionists: 'Nutritionists',
inquiries: 'Inquiries',
content:  'Content',
subscriptions: 'Subscriptions',
settings: 'Settings',
}

const NOTIFICATIONS = [
{ name: 'Khalid Nasser', message: 'Subscription Renewal Issue', unread: true },
{ name: 'Reem Fahad',  message: 'Wrong meal plan assigned',  unread: true },
{ name: 'Mona Sami', message: 'Cannot login to my account',  unread: false },
]

const AdminDashboard = () => {
 const [activePage, setActivePage] = useState('dashboard')
 const { logout } = useAuth()

 const handleLogout = () => logout()

 const renderPage = () => {
 switch (activePage) {
 case 'dashboard':  return <Dashboard />
 case 'clients':  return <Clients />
 case 'nutritionists': return <Nutritionists />
 case 'inquiries':  return <Inquiries />
 case 'content':  return <Content />
 case 'subscriptions': return <Subscriptions />
 case 'settings': return <Settings />
case 'comminity': return <Comminity/>
case 'offermanagement': return <OffersManagement/>
default: return <Dashboard />
 }
 }

 return (
 <AdminLayout
 activePage={activePage}
 onNavigate={setActivePage}
 onLogout={handleLogout}
 pageName={PAGE_NAMES[activePage]}
 notifications={NOTIFICATIONS}
 inquiryBadge={NOTIFICATIONS.filter(n => n.unread).length}
 >
 {renderPage()}
 </AdminLayout>
 )
}

export default AdminDashboard
