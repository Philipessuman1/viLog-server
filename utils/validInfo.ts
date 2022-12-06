module.exports = (req: { body: { email: any; password: any; }; path: string; }, res: {
    [x: string]: any; json: (arg0: string) => any; 
}, next: () => void): any => {
    const { email, password } = req.body;

    function validEmail(userEmail: string) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
    }

    if (req.path === "/newadmin") {
        console.log(!email.length);
        if (![email, password].every(Boolean)) {
            return res.status(401).json("Missing Credentials");
        } else if (!validEmail(email)) {
            return res.status(401).json("Invalid Email");
        }
    } else if (req.path === "/adminlogin") {
        if (![email, password].every(Boolean)) {
            return res.status(401).json("Missing Credentials");
        } else if (!validEmail(email)) {
            return res.status(401).json("Invalid Email");
        }
    }

    next();
};
  