// const asyncHandler = (requestHandler) => {
//     (req, res, next) => {
//         Promise.resolve( requestHandler(req, res, next) ).catch((err) => next(err))
//     }
// }
// isse ham ek baar promise ko likhne ke baad use use karte hain hame baar baar likhne ki jaroorat nahi hai.
const asyncHandler = (func) => async(req, res, next) => {
    try {
        await func(req, res, next)
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}
export { asyncHandler }