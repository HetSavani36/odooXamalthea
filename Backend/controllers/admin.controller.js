import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getCurrencyByCountry } from "../utils/currencyHelper.js";
import { sendEmail } from "../utils/email.js";

function generatePassword(length = 8) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

const createEmployee = asyncHandler(async (req, res) => {
  const { name, email, country, managerId } = req.body;
  if (!name || !email || !country)
    throw new ApiError(403, "provide all fields");

  const currency = await getCurrencyByCountry(country);
  if (!currency) throw new ApiError(400, "incorrect country");

  const manager = await User.findById(managerId);
  if (!manager || manager.role != "manager")
    throw new ApiError(404, "manager not found");

  const password=generatePassword(7)

  const existingUser=await User.findOne({email:email})
  if(existingUser) throw new ApiError(403,"user already found")

  let user = await User.create({
    name: name,
    email: email,
    password: password,
    role: "employee",
    companyId: req.user.companyId,
    managerId: managerId,
    currency: {
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
    },
  });
  if (!user) throw new ApiError(500, "user creation failed");

  const emailText = `
      Hello Employee,

      Your employee account has been created successfully.

      Email: ${email}
      Password: ${password}

      Please login and change your password immediately.
    `;
  await sendEmail(email, "Your Employee Account Password", emailText, null);

  res.json(
    new ApiResponse(201,{},"new employee created")
  )
});


const createManager = asyncHandler(async (req, res) => {
  const { name, email, country } = req.body;
  if (!name || !email || !country)
    throw new ApiError(403, "provide all fields");

    const existingUser = await User.findOne({ email: email });
    if (existingUser) throw new ApiError(403, "user already found");

    const currency = await getCurrencyByCountry(country);
    if (!currency) throw new ApiError(400, "incorrect country");

    const password = generatePassword(7);

    let user = await User.create({
        name: name,
        email: email,
        password: password,
        role: "manager",
        companyId: req.user.companyId,
        managerId: req.user._id,
        currency: {
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        },
    });
    if (!user) throw new ApiError(500, "user creation failed");

    const emailText = `
        Hello Manager,

        Your manager account has been created successfully.

        Email: ${email}
        Password: ${password}

        Please login and change your password immediately.
        `;
    await sendEmail(email, "Your Manager Account Password", emailText, null);

    res.json(new ApiResponse(201, {}, "new manager created"));
});

export { createEmployee, createManager };