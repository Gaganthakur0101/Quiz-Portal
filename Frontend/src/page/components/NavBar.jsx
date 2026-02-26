// components/Navigation/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
// import PropTypes from 'prop-types';
import { 
  IoNotifications, 
  IoSearch, 
  IoMenu, 
  IoClose,
  IoChevronDown,
  IoSettings,
  IoLogOut,
  IoPersonCircle
} from 'react-icons/io5';

// Custom hook for outside click detection
const useOutsideClick = (handler) => {
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handler]);

  return ref;
};

// Notification Badge Component
const NotificationBadge = ({ count = 0, onClick }) => (
  <button
    onClick={onClick}
    className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
    aria-label={`${count} notifications`}
  >
    <IoNotifications className="text-xl" />
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
        {count > 99 ? '99+' : count}
      </span>
    )}
  </button>
);

// Search Component
const SearchBar = ({ isExpanded, onToggle, onSearch }) => (
  <div className="relative">
    {!isExpanded ? (
      <button
        onClick={onToggle}
        className="p-2 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
        aria-label="Open search"
      >
        <IoSearch className="text-xl" />
      </button>
    ) : (
      <div className="flex items-center bg-zinc-700 rounded-lg px-3 py-2 min-w-[200px] transition-all duration-300">
        <IoSearch className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search quizzes..."
          className="bg-transparent text-white placeholder-gray-400 outline-none flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearch(e.target.value);
              onToggle();
            }
            if (e.key === 'Escape') {
              onToggle();
            }
          }}
          autoFocus
        />
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white ml-2"
          aria-label="Close search"
        >
          <IoClose />
        </button>
      </div>
    )}
  </div>
);

// User Profile Dropdown
const UserProfileDropdown = ({ user, isOpen, onToggle, onClose }) => {
  const dropdownRef = useOutsideClick(onClose);

  const menuItems = [
    { icon: IoPersonCircle, label: 'Profile', action: 'profile' },
    { icon: IoSettings, label: 'Settings', action: 'settings' },
    { icon: IoLogOut, label: 'Logout', action: 'logout' }
  ];

  const handleMenuClick = (action) => {
    console.log(`${action} clicked`);
    onClose();
    // Implement actual navigation/actions here
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-zinc-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="User menu"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <span className="hidden sm:block text-white font-medium">
          {user?.name || 'User'}
        </span>
        <IoChevronDown 
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 py-2 z-50 animate-fade-in">
          <div className="px-4 py-2 border-b border-zinc-700">
            <p className="text-white font-medium">{user?.name || 'User'}</p>
            <p className="text-gray-400 text-sm">{user?.email || 'user@example.com'}</p>
          </div>
          
          {menuItems.map((item) => (
            <button
              key={item.action}
              onClick={() => handleMenuClick(item.action)}
              className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-zinc-700 transition-colors duration-200 text-gray-300 hover:text-white"
            >
              <item.icon className="text-lg" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Mobile Navigation Menu
const MobileMenu = ({ isOpen, onClose, user }) => (
  <div className={`
    fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300
    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
  `}>
    <div className={`
      fixed right-0 top-0 h-full w-80 bg-zinc-800 shadow-lg transform transition-transform duration-300
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Close menu"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3 p-3 bg-zinc-700 rounded-lg mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-white font-medium">{user?.name || 'User'}</p>
            <p className="text-gray-400 text-sm">{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {[
            { label: 'Dashboard', href: '/' },
            { label: 'Quizzes', href: '/quizzes' },
            { label: 'Results', href: '/results' },
            { label: 'Profile', href: '/profile' },
            { label: 'Settings', href: '/settings' }
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors duration-200"
              onClick={onClose}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          className="w-full mt-6 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          onClick={() => {
            console.log('Logout clicked');
            onClose();
          }}
        >
          <IoLogOut />
          <span>Logout</span>
        </button>
      </div>
    </div>
  </div>
);

// Main Navbar Component
const Navbar = ({ 
  user, 
  brandName = "Quizzy", 
  notificationCount = 0,
  onNotificationClick,
  onSearch 
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menus on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileMenuOpen(false);
      setIsUserMenuOpen(false);
      setIsSearchExpanded(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (query) => {
    console.log('Search query:', query);
    onSearch?.(query);
  };

  const handleNotificationClick = () => {
    console.log('Notifications clicked');
    onNotificationClick?.();
  };

  return (
    <>
      <nav className="sticky top-0 w-full p-4 lg:p-8 text-white bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 z-40">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto px-4 lg:px-8 py-4 bg-zinc-800 rounded-full shadow-lg">
          {/* Brand Logo */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {brandName}
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <SearchBar
              isExpanded={isSearchExpanded}
              onToggle={() => setIsSearchExpanded(!isSearchExpanded)}
              onSearch={handleSearch}
            />
            
            <NotificationBadge
              count={notificationCount}
              onClick={handleNotificationClick}
            />

            <UserProfileDropdown
              user={user}
              isOpen={isUserMenuOpen}
              onToggle={() => setIsUserMenuOpen(!isUserMenuOpen)}
              onClose={() => setIsUserMenuOpen(false)}
            />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-4">
            <NotificationBadge
              count={notificationCount}
              onClick={handleNotificationClick}
            />
            
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
              aria-label="Open menu"
            >
              <IoMenu className="text-xl" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
      />
    </>
  );
};

// PropTypes for type checking
// Navbar.propTypes = {
//   user: PropTypes.shape({
//     name: PropTypes.string,
//     email: PropTypes.string
//   }),
//   brandName: PropTypes.string,
//   notificationCount: PropTypes.number,
//   onNotificationClick: PropTypes.func,
//   onSearch: PropTypes.func
// };

// NotificationBadge.propTypes = {
//   count: PropTypes.number,
//   onClick: PropTypes.func
// };

// SearchBar.propTypes = {
//   isExpanded: PropTypes.bool.isRequired,
//   onToggle: PropTypes.func.isRequired,
//   onSearch: PropTypes.func.isRequired
// };

// UserProfileDropdown.propTypes = {
//   user: PropTypes.shape({
//     name: PropTypes.string,
//     email: PropTypes.string
//   }),
//   isOpen: PropTypes.bool.isRequired,
//   onToggle: PropTypes.func.isRequired,
//   onClose: PropTypes.func.isRequired
// };

// MobileMenu.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   user: PropTypes.shape({
//     name: PropTypes.string,
//     email: PropTypes.string
//   })
// };

export default Navbar;
