function Footer() {
  return (
    <footer className="bg-gray-900 text-white dark:bg-black p-10 mt-[50px] transition-colors duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

        {/* About */}
        <div>
          <h3 className="font-bold mb-4">ABOUT</h3>
          <p className="text-sm text-gray-300 dark:text-gray-400 mb-2 cursor-pointer hover:underline">Contact Us</p>
          <p className="text-sm text-gray-300 dark:text-gray-400 mb-2 cursor-pointer hover:underline">About Us</p>
          <p className="text-sm text-gray-300 dark:text-gray-400 mb-2 cursor-pointer hover:underline">Careers</p>
          <p className="text-sm text-gray-300 dark:text-gray-400 mb-2 cursor-pointer hover:underline">Press</p>
        </div>

        {/* Help */}
        <div>
          <h3 className="font-bold mb-4">HELP</h3>
          <p className="text-sm text-gray-300 dark:text-gray-400 mb-2 cursor-pointer hover:underline">Payments</p>
          <p className="text-sm text-gray-300 dark:text-gray-400 mb-2 cursor-pointer hover:underline">Shipping</p>
          <p className="text-sm text-gray-300 dark:text-gray-400 mb-2 cursor-pointer hover:underline">Cancellation</p>
          <p className="text-sm text-gray-300 dark:text-gray-400 mb-2 cursor-pointer hover:underline">FAQ</p>
        </div>

        {/* Policy */}
        <div>
          <h3 className="font-bold mb-4">POLICY</h3>
          <p className="text-sm text-gray-300 dark:text-gray-400 mb-2 cursor-pointer hover:underline">Return Policy</p>
          <p className="text-sm text-gray-300 dark:text-gray-400 mb-2 cursor-pointer hover:underline">Terms Of Use</p>
          <p className="text-sm text-gray-300 dark:text-gray-400 mb-2 cursor-pointer hover:underline">Security</p>
          <p className="text-sm text-gray-300 dark:text-gray-400 mb-2 cursor-pointer hover:underline">Privacy</p>
        </div>

        {/* Social */}
        <div>
          <h3 className="font-bold mb-4">SOCIAL</h3>
          <p className="text-sm text-gray-300 dark:text-gray-400 mb-2 cursor-pointer hover:underline">Instagram</p>
          <p className="text-sm text-gray-300 dark:text-gray-400 mb-2 cursor-pointer hover:underline">Facebook</p>
          <p className="text-sm text-gray-300 dark:text-gray-400 mb-2 cursor-pointer hover:underline">Twitter</p>
          <p className="text-sm text-gray-300 dark:text-gray-400 mb-2 cursor-pointer hover:underline">YouTube</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-700 dark:border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
        © 2026 FastCart | All Rights Reserved
      </div>
    </footer>
  );
}

export default Footer;