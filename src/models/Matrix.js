import mongoose, { Mongoose } from "mongoose";

const matrixSchema = new mongoose.Schema({
    rows: {
        type: Number,
        required: true,
        default: 8
    },
    cols: {
        type: Number,
        required: true,
        default: 8
    },
    matrix: [
        {
            _id: {
                type: String,
                required: true
            },
            x: {
                type: String,
                required: true
            },
            y: {
                type: String,
                required: true
            },
            color: {
                type: String,
                default: "#FFFFFF"
            }
        }
    ]
});

mongoose.set("useFindAndModify", false);

/**
 * Returns an array of matrix pixel objects given an array of coordinates.
 * Example:
 * Input: Array of coorinates: [["0","0"], ["0","3]]
 * Output: Array of matrix pixels:
 * [
 * {
 *   "matrix": [
 *     {
 *       "color": "#FFFFFF",
 *       "_id": "00",
 *       "x": "0",
 *       "y": "0"
 *     },
 *     {
 *       "color": "#FFFFFF",
 *       "_id": "03",
 *       "x": "0",
 *       "y": "3"
 *     }
 *   ]
 *  }
 */
matrixSchema.statics.findByCoordinates = async function(coordinates) {
    const matchOrCond = [];
    const projectOrCond = [];

    // Build mongoose query conditions based on input coordinates..

    for (let i = 0; i < coordinates.length; i++) {
        const xcoord = {};
        const ycoord = {};
        const eqx = {};
        const eqy = {};
        const eqXCond = [];
        const eqYCond = [];
        const projectAnd = [];
        const xycoord = [];
        if (coordinates[i][0]) {
            xcoord = { x: coordinates[i][0] };
            xycoord.push(xcoord);
            eqXCond = ["$$matrix.x", coordinates[i][0]];
            eqx = { $eq: eqXCond };
            projectAnd.push(eqx);
        }
        if (coordinates[i][1]) {
            ycoord = { y: coordinates[i][1] };
            xycoord.push(ycoord);
            eqYCond = ["$$matrix.y", coordinates[i][1]];
            eqy = { $eq: eqYCond };
            projectAnd.push(eqy);
        }
        const matchAndCond = { $and: xycoord };
        matchOrCond.push(matchAndCond);

        const projectAndCond = { $and: projectAnd };
        projectOrCond.push(projectAndCond);
    }

    let pixels = await Matrix.collection
        .aggregate([
            {
                $match: {
                    matrix: {
                        $elemMatch: {
                            $or: matchOrCond
                        }
                    }
                }
            },
            {
                $project: {
                    matrix: {
                        $filter: {
                            input: "$matrix",
                            as: "matrix",
                            cond: {
                                $or: projectOrCond
                            }
                        }
                    },
                    rows: 1,
                    cols: 1,
                    _id: 1
                }
            }
        ])
        .toArray();
    let match = { $match: { matrix: { $elemMatch: { $or: matchOrCond } } } };
    let project = {
        $project: {
            matrix: {
                $filter: {
                    input: "$matrix",
                    as: "matrix",
                    cond: { $or: projectOrCond }
                }
            },
            rows: 1,
            cols: 1,
            _id: 1
        }
    };
    let aggregation = [match, project];
    let result = {
        pixels: pixels,
        aggregation: aggregation
    };
    return result;
};

/**
 * Creates a new matrix given specified rows columns and pixel color.
 */
matrixSchema.statics.resetMatrix = async function(rows, cols, color) {
    const pixels = [];
    let matrixArray = [];

    let idx = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            pixels[idx] = {
                _id: i.toString() + j.toString(),
                x: i,
                y: j,
                color: color
            };
            idx++;
        }
    }

    try {
        await Matrix.deleteMany({});
        const matrix = new Matrix({
            rows: rows,
            cols: cols,
            matrix: pixels
        });
        await matrix.save();
        matrixArray = await Matrix.find({}).exec();
        console.log(JSON.stringify(matrixArray));
    } catch (error) {
        console.error(`matrix initiaization error: ${error}`);
    }
    return matrixArray;
};

matrixSchema.statics.updatePixels = async function(coordinates, color) {
    const queryOrCond = [];
    const filterOrCond = [];
    const projectionOrCond = [];

    for (let i = 0; i < coordinates.length; i++) {
        const queryXcoord = { "matrix.x": coordinates[i][0] };
        const queryYcoord = { "matrix.y": coordinates[i][1] };
        const queryAndCond = { $and: [queryXcoord, queryYcoord] };
        queryOrCond.push(queryAndCond);
        projectionOrCond.push(queryAndCond);
        const xcoord = { "elem.x": coordinates[i][0] };
        const ycoord = { "elem.y": coordinates[i][1] };
        const filterAndCond = { $and: [xcoord, ycoord] };
        filterOrCond.push(filterAndCond);
    }
    const filterOr = { $or: filterOrCond };
    const arrayFilters = [];
    arrayFilters.push(filterOr);
    const projectionOr = { $or: projectionOrCond };
    const query = { $or: queryOrCond };
    const update = { $set: { "matrix.$[elem].color": color } };
    const options = {
        new: true,
        arrayFilters: arrayFilters,
        projection: projectionOr,
        fields: {
            rows: 1,
            cols: 1,
            matrix: 1
        }
    };

    let updated = await Matrix.findOneAndUpdate(query, update, options).exec();
    let aggregation = { query: query, update: update, options: options };
    let result = { updated: updated, aggregation: aggregation };

    return result;

    /**
     * Example mongoose mongodb update:
     * 
    const query = {
        $or: [
            { $and: [{ "matrix.x": "0" }, { "matrix.y": "0" }] },
            { $and: [{ "matrix.x": "0" }, { "matrix.y": "1" }] },
            { $and: [{ "matrix.x": "0" }, { "matrix.y": "2" }] },
            { $and: [{ "matrix.x": "1" }, { "matrix.y": "0" }] },
            { $and: [{ "matrix.x": "1" }, { "matrix.y": "1" }] },
            { $and: [{ "matrix.x": "1" }, { "matrix.y": "2" }] }
        ]
    };
    const options = {
        new: true,
        arrayFilters: [
            {
                $or: [
                    { $and: [{ "elem.x": "0" }, { "elem.y": "0" }] },
                    { $and: [{ "elem.x": "0" }, { "elem.y": "1" }] },
                    { $and: [{ "elem.x": "0" }, { "elem.y": "2" }] },
                    { $and: [{ "elem.x": "1" }, { "elem.y": "0" }] },
                    { $and: [{ "elem.x": "1" }, { "elem.y": "1" }] },
                    { $and: [{ "elem.x": "1" }, { "elem.y": "2" }] }
                ]
            }
        ],
        projection: {
            $or: [
                { $and: [{ "matrix.x": "0" }, { "matrix.y": "0" }] },
                { $and: [{ "matrix.x": "0" }, { "matrix.y": "1" }] },
                { $and: [{ "matrix.x": "0" }, { "matrix.y": "2" }] },
                { $and: [{ "matrix.x": "1" }, { "matrix.y": "0" }] },
                { $and: [{ "matrix.x": "1" }, { "matrix.y": "1" }] },
                { $and: [{ "matrix.x": "1" }, { "matrix.y": "2" }] }
            ]
        },
        fields: {
            rows: 1,
            cols: 1,
            matrix: 1
        }
    };
*/
};
const Matrix = mongoose.model("Matrix", matrixSchema);
export default Matrix;
