/**
 * Centralized company information for Shree Sakhi Events.
 * Sourced strictly from the official 'Details About Shree Sakhi Events' PDF.
 */

export const COMPANY_INFO = {
  name: 'Shree Sakhi Events',
  tagline: 'Platform Dedicated to Women Empowerment, Entrepreneurship & Business Growth',
  address: 'Shree Sakhi Events, Nashik Road, Nashik',
  city: 'Nashik',
  state: 'Maharashtra',

  introduction:
    'Shree Sakhi Events is a platform dedicated to women empowerment, entrepreneurship and business growth. We organize grand exhibitions that bring women entrepreneurs, home based businesses, brands and customers together under one roof. Our aim is to provide opportunities for women to showcase their products and grow their businesses.',

  vision:
    'Our vision to become a leading platform for women entrepreneurs by creating opportunities for business growth, creativity and financial independence',

  mission:
    'Our mission is to empower women entrepreneurs by providing them with a platform to showcase their products, connect with customers, build their brands and achieve business success.',

  contactPersons: [
    { name: 'Nidhi Patel', phone: '9145683687' },
    { name: 'Kamlesh Patel', phone: '9325051015' },
    { name: 'Bhavna Patel', phone: '9595393434' },
    { name: 'Sunil Patel', phone: '9325023230' },
  ],

  whatsappNumbers: ['9145683687', '9595393434'],

  /**
   * Confirmed official company email address.
   * All enquiry notifications must be sent to this address.
   */
  email: 'shreesakhi26@gmail.com',
  enquiryNotificationEmail: 'shreesakhi26@gmail.com',

  /**
   * Official Instagram Profile Link
   */
  instagram: 'https://www.instagram.com/shree_sakhi_events?cplk=MXJ2YXUyZmx1eGx6Mg==',
};

/**
 * Format a 10-digit Indian phone number into readable format: +91 XXXXX XXXXX
 * @param {string} phone
 * @returns {string}
 */
export function formatIndianPhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    const local = digits.slice(2);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return `+91 ${digits}`;
}
