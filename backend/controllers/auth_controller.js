import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// email signup
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email & password required" });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser && existingUser.password) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const user = await User.findOneAndUpdate(
      { email },
      { name, email, password: hashedPass },
      { new: true, upsert: true }
    );

    // CREATE TOKEN
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    // SEND TOKEN BACK
    res.json({
      success: true,
      message: "Registered successfully",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// email login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const correct = await bcrypt.compare(password, user.password);
    if (!correct) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    res.json({ success: true, message: "Login successful", token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// google auth callback (handles the code from frontend)
export const googleAuth = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      console.log('Missing code in request body');
      return res.status(400).json({ success: false, message: "No authorization code provided" });
    }

    console.log('Exchanging code for tokens...');  // Debug log

    // Step 1: Exchange code for access_token and id_token
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env');
      return res.status(500).json({ success: false, message: "Server config error" });
    }

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        // redirect_uri: "https://www.printmaania.com/google/callback",  // Exact match for Google Console
        redirect_uri: "http://localhost:5173/google/callback", 
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${tokenResponse.statusText} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, id_token } = tokenData;

    if (!access_token || !id_token) {
      console.error('No tokens in response:', tokenData);
      return res.status(400).json({ success: false, message: "Failed to get tokens from Google" });
    }

    console.log('Fetching user info...');  // Debug log

    // Step 2: Get user info from Google
    const userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
    const userInfoResponse = await fetch(userInfoUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error('User info fetch failed:', errorText);
      throw new Error(`User info fetch failed: ${userInfoResponse.statusText} - ${errorText}`);
    }

    const userInfo = await userInfoResponse.json();
    const { sub: googleId, name, email } = userInfo;  // sub = googleId

    if (!googleId || !email) {
      console.error('Incomplete user info:', userInfo);
      return res.status(400).json({ success: false, message: "Incomplete user info from Google" });
    }

    console.log('User info received:', { googleId, name, email });  // Debug log (no sensitive data)

    // Step 3: Find or create user in DB
    let user = await User.findOne({ googleId });

    if (!user) {
      // New Google user or existing email user upgrading to Google
      user = await User.findOne({ email });

      if (user && user.password) {
        // Existing email user: add Google ID
        user = await User.findByIdAndUpdate(
          user._id,
          { googleId, name },  // No avatar
          { new: true }
        );
      } else {
        // Truly new user
        user = await User.create({
          googleId,
          name,
          email,
          role: "user",
        });
      }
    } else {
      // Existing Google user: update name/email if changed (rare)
      user = await User.findByIdAndUpdate(
        user._id,
        { name, email },  // No avatar
        { new: true }
      );
    }

    // Step 4: Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    // Strip password before sending (security!)
    const { password, ...userResponse } = user.toObject();

    console.log('Google auth success for user:', userResponse.email);  // Debug log

    res.json({ success: true, message: "Google login successful", token, user: userResponse });
  } catch (err) {
    console.error("Google auth error:", err);  // This is what you'll see in backend logs
    res.status(500).json({ success: false, message: err.message || "Google authentication failed" });
  }
};