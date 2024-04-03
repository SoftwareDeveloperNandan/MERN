// const asyncHandler = (requestHandler) => {
//     (req, res, next) => {
//         Promise.resolve( requestHandler(req, res, next) ).catch((err) => next(err))
//     }
// }
// isse ham ek baar promise ko likhne ke baad use use karte hain hame baar baar likhne ki jaroorat nahi hai.
// const asyncHandler = (func) => async (req, res, next) => {
//     try {
//         await func(req, res, next);
//     } catch (error) {
//         const statusCode = error.code || 500; // Default to 500 for server errors
//         res.status(statusCode).json({
//             success: false,
//             message: error.message
//         });
//     }
// };


const asyncHandler = (func) => async (req, res, next) => {
    try {
        await func(req, res, next);
    } catch (error) {
        // Determine the appropriate status code
        const statusCode = error.code || 500; // Default to 500 for server errors

        // Ensure that the status code is within the valid range
        const validStatusCode = (statusCode >= 100 && statusCode <= 599) ? statusCode : 500;

        // Log the error for debugging purposes
        console.error('Error:', error);

        // Send an appropriate response with the error message
        res.status(validStatusCode).json({
            success: false,
            message: error.message || 'Internal Server Error'
        });
    }
};

export { asyncHandler };

