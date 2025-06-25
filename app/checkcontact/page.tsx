'use client';

import { useState, useEffect,useContext } from 'react';
import { MyContext } from '../providers';


// Simple SVG icons as components
const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const MailIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BookmarkIcon = ({ className, filled = false }) => (
  <svg className={className} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const ContactsList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
    const { value, setValue ,user,setUser} = useContext(MyContext);
 
  const [expandedContact, setExpandedContact] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [bookmarkedContacts, setBookmarkedContacts] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Fetch contacts from API

  useEffect(() => {
    if (user.email=="verigeektech@gmail.com" || user.email=="omdaga6@gmail.com") {
      // User is authenticated, proceed with fetching contacts
      // Redirect to login or handle unauthenticated state
      
    }else{
        window.location.href = '/';
    }
  }, [user]);
  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contact');
      const data = await response.json();
      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle bookmark
  const toggleBookmark = (id) => {
    const newBookmarkedContacts = new Set(bookmarkedContacts);
    if (newBookmarkedContacts.has(id)) {
      newBookmarkedContacts.delete(id);
    } else {
      newBookmarkedContacts.add(id);
    }
    setBookmarkedContacts(newBookmarkedContacts);
    // Note: In a real app, you would save to localStorage here
    // localStorage.setItem('bookmarkedContacts', JSON.stringify([...newBookmarkedContacts]));
  };

  // Confirm delete
  const confirmDelete = (id) => {
    setShowDeleteConfirm(id);
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };
  const deleteContact = async (id) => {
    setDeleting(id);
    try {
      const response = await fetch(`/api/contact?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setContacts(contacts.filter(contact => contact._id !== id));
        if (expandedContact === id) {
          setExpandedContact(null);
        }
      } else {
        alert('Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Error deleting contact');
    } finally {
      setDeleting(null);
    }
  };

  // Toggle contact expansion
  const toggleExpand = (id) => {
    setExpandedContact(expandedContact === id ? null : id);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchContacts();
    // Note: In a real app, you would load bookmarks from localStorage here
    // const savedBookmarks = localStorage.getItem('bookmarkedContacts');
    // if (savedBookmarks) {
    //   setBookmarkedContacts(new Set(JSON.parse(savedBookmarks)));
    // }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg shadow mb-4 p-6">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Contact Messages</h1>
          <p className="text-gray-400">
            {contacts.length} {contacts.length === 1 ? 'message' : 'messages'} received
          </p>
        </div>

        {contacts.length === 0 ? (
          <div className="text-center py-12">
            <MailIcon className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No messages yet</h3>
            <p className="text-gray-400">Contact messages will appear here when received.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact._id}
                className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-xl hover:border-gray-600"
              >
                {/* Contact Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-750 transition-colors duration-150"
                  onClick={() => toggleExpand(contact._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{contact.name}</h3>
                          <p className="text-sm text-gray-400">{contact.email}</p>
                        </div>
                        {bookmarkedContacts.has(contact._id) && (
                          <div className="ml-2">
                            <BookmarkIcon className="w-5 h-5 text-yellow-400" filled={true} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium text-gray-200">{contact.subject}</h4>
                        {contact.createdAt && (
                          <span className="text-sm text-gray-500">
                            {formatDate(contact.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(contact._id);
                        }}
                        className={`p-2 rounded-full transition-colors duration-150 ${
                          bookmarkedContacts.has(contact._id)
                            ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10'
                            : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
                        }`}
                        title={bookmarkedContacts.has(contact._id) ? 'Remove bookmark' : 'Add bookmark'}
                      >
                        <BookmarkIcon className="w-5 h-5" filled={bookmarkedContacts.has(contact._id)} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(contact._id);
                        }}
                        disabled={deleting === contact._id}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-full transition-colors duration-150 disabled:opacity-50"
                        title="Delete contact"
                      >
                        {deleting === contact._id ? (
                          <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <TrashIcon className="w-5 h-5" />
                        )}
                      </button>
                      {expandedContact === contact._id ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Message */}
                {expandedContact === contact._id && (
                  <div className="px-6 pb-6 border-t border-gray-700">
                    <div className="pt-4">
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Message:</h5>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                          {contact.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-sm mx-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Delete Contact</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this contact? This action cannot be undone.
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteContact(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-150"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsList;