import jwt from "jsonwebtoken";

export async function isAuthenticated(req, res, next) {
   try {
      const tokenn = await req.cookies.token;
      if (!tokenn) {
         res.status(401).json({
            message: "User not authenticated",
            success: false
         });
         return;
      }

      const decode = jwt.verify(tokenn, process.env.SECRET_KEY);
      if (!decode) {
         res.status(401).json({
            message: "Invalid token",
            success: false
         });
         return;
      }

      req.userId = decode.id;
      next();
   } catch (error) {
      console.error("Authentication error:", error.message);
      return res.status(500).json({
         message: "Authentication error",
         success: false
      });
   }
}
