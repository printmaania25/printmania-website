const backapi = "http://localhost:5001";

const Allapi = {
  signup: {
    url: `${backapi}/api/auth/register`,
    method: "POST",
  },
  login: {
    url: `${backapi}/api/auth/login`,
    method: "POST",
  },
  google: {
    url: `${backapi}/api/auth/google`,
    method: "POST",
  },
};

export default Allapi;
