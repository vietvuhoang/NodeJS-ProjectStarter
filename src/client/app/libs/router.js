'use strict';

var routes = {
    ROOT: '',
    HOME: '/',
    ORDERS: '/orders/(:id)',  
    USERS: '/users/(:id)',
    ADD: '/request',
    MYPROFILE: '/profile',
    SUPPORT: '/support',
    HELP: '/help',
    LOGIN: '/login',
    LOGOUT: '/logout',
    REGISTER: '/register',
    NOTIFICATIONS: '/notifications',
};

var navigation = [
    {
        route: routes.LOGIN,
        name: 'Login',
        requiredPermissions: []
    },
    {
        route: routes.REGISTER,
        name: 'Register',
        requiredPermissions: []
    },
    {
        route: routes.HOME,
        name: 'Dashboard',
        requiredPermissions: [permissions.EDIT_PROFILE],
        position: global.MENUBAR,
        icon : 'fa fa-home'
    },
    {
        route: routes.ORDERS,
        name: 'Orders',
        requiredPermissions: [permissions.VIEW_OWN_ORDERS],
        position: global.MENUBAR,
        icon : 'fa fa-th-list'
    },
    {
        route: routes.USERS,
        name: 'Users',
        requiredPermissions: [permissions.USER_MANAGEMENT],
        position: global.MENUBAR,
        icon : 'fa fa-users'
    },
    {
        route: routes.ADD,
        name: 'Create Request',
        requiredPermissions: [permissions.MAINTAIN_OWN_ORDERS],
        position: global.TOOLSBAR,
        icon : 'fa fa-plus'
    },
    {
        route: routes.SUPPORT,
        name: 'Support',
        requiredPermissions: [permissions.VIEW_OWN_ORDERS],
        position: global.TOOLSBAR,
        icon : 'fa fa-support'
    },
    {
        route: routes.HELP,
        name: 'Help',
        requiredPermissions: [permissions.EDIT_PROFILE],
        position: global.TOOLSBAR,
        icon : 'fa fa-question-circle'
    },
    {
        route: routes.NOTIFICATIONS,
        name: 'Notification',
        requiredPermissions: [permissions.EDIT_PROFILE],
        position: global.TOOLSBAR,
        icon : 'glyphicon glyphicon-envelope'
    },
    {
        route: routes.MYPROFILE,
        name: 'Profile',
        requiredPermissions: [permissions.EDIT_PROFILE],
        position: global.TOOLSBAR,
        icon : 'fa fa-user'
    },
    {
        route: routes.LOGOUT,
        name: 'Logout',
        requiredPermissions: [permissions.EDIT_PROFILE],
        position: global.TOOLSBAR,
        icon : 'fa fa-sign-out'
    }
    
];
