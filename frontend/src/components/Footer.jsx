function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#172337",
        color: "white",
        padding: "40px 20px",
        marginTop: "50px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "30px",
        }}
      >

        {/* About */}
        <div>
          <h3 style={{ marginBottom: "15px" }}>ABOUT</h3>

          <p>Contact Us</p>
          <p>About Us</p>
          <p>Careers</p>
          <p>Press</p>
        </div>

        {/* Help */}
        <div>
          <h3 style={{ marginBottom: "15px" }}>HELP</h3>

          <p>Payments</p>
          <p>Shipping</p>
          <p>Cancellation</p>
          <p>FAQ</p>
        </div>

        {/* Policy */}
        <div>
          <h3 style={{ marginBottom: "15px" }}>POLICY</h3>

          <p>Return Policy</p>
          <p>Terms Of Use</p>
          <p>Security</p>
          <p>Privacy</p>
        </div>

        {/* Social */}
        <div>
          <h3 style={{ marginBottom: "15px" }}>SOCIAL</h3>

          <p>Instagram</p>
          <p>Facebook</p>
          <p>Twitter</p>
          <p>YouTube</p>
        </div>
      </div>

      {/* Bottom */}
      <div
        style={{
          borderTop: "1px solid gray",
          marginTop: "30px",
          paddingTop: "20px",
          textAlign: "center",
          fontSize: "14px",
        }}
      >
        © 2026 FastCart | All Rights Reserved
      </div>
    </footer>
  );
}

export default Footer;