const Gig = require("../models/gig.model.js");
const User = require("../models/user.model.js");
const createError = require("../utils/createError.js");

const createGig = async (req, res, next) => {
  if (!req.isSeller)
    return next(createError(403, "Only creators can create a gig!"));

  const newGig = new Gig({
    userId: req.userId,
    ...req.body,
  });

  try {
    
    const savedGig = await newGig.save();
    res.status(201).json(savedGig);
  } catch (err) {
    next(err);
  }
};

const deleteGig = async (req, res, next)=>{
    try {
        
        const gig =  await Gig.findById(req.params.id);

        if (gig.creatorId !== req.creatorId)
            return next(createError(403, "You can delete only your gig!"));
        
        await Gig.findByIdAndDelete(req.params.id);
        res.status(200).send("Gig has been deleted!");
    } catch (err) {
        next(err);
    }
};

const updateGig = async (req, res, next) => {
    try {
      
      const gig = await Gig.findById(req.params.id);
      
      if (!gig) {
        return next(createError(404, "Gig not found!"));
      }
      
      if (gig.creatorId !== req.creatorId) {
        return next(createError(403, "You can update only your gig!"));
      }
      
      const updatedGig = await Gig.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      
      res.status(200).json(updatedGig);
    } catch (err) {
      next(err);
    }
  };
  

const getGig = async (req, res, next)=>{
    try {
        
        const gig = await Gig.findById(req.params.id);
        if (!gig) next(createError(404, "Gig not found!"));
        res.status(200).send(gig);
    } catch (err) {
        next(err);
    }
    
};

const getGigs = async (req, res, next) => {
  const calculateRelevanceScore = (gig, userLikeCount) => {
    const now = Date.now();
    const tenDaysAgo = now - 10 * 24 * 60 * 60 * 1000;
    const retentionTimeInSeconds = gig.retentionTime / 1000;
    const randomFactor = 0.7 + Math.random() * 0.6;
  
    const userLikeScore = userLikeCount;
    const timeScore = Math.min((now - gig.createdAt), tenDaysAgo) / 1000 / 60 / 60;
    const retentionScore = retentionTimeInSeconds + gig.views;
  
    return (userLikeScore - timeScore + retentionScore) * randomFactor;
  };

  const q = req.query;
  const filters = {
    ...(q.userId && { userId: q.userId }),
    ...(q.tag && { tag: q.tag }),
    ...((q.min || q.max) && {
      price: { ...(q.min && { $gt: q.min }), ...(q.max && { $lt: q.max }) },
    }),
    ...(q.search && {
      $or: [
        { title: { $regex: q.search, $options: "i" } },
        { desc: { $regex: q.search, $options: "i" } },
      ],
    }),
  };

  try {
    
    let gigs = await Gig.find(filters); // Use populate to fetch the user data
    const gigsWithUserData = [];

    // Calculate relevance score for each gig
    for (const gig of gigs) {
      const user = await User.findById(gig.userId); // User data is already populated using populate()
      const relevanceScore = calculateRelevanceScore(gig, user.like);

      // Include gig properties and relevant user properties in the final object
      const gigWithUserData = {
        ...gig.toObject(),
        relevanceScore,
        user: {
          _id: user._id,
          name: user.name,
          lastname: user.lastname,
          isSeller: user.isSeller,
          img: user.img,
          like: user.like,
          sub: user.sub
          // Add more user properties if needed
        },
      };

      gigsWithUserData.push(gigWithUserData);
    }

    // Sort gigs based on relevance score
    gigsWithUserData.sort((gigA, gigB) => gigB.relevanceScore - gigA.relevanceScore);

    // Check if userId is included in the search, and if so, sort by creation date
    if (q.userId) {
      gigsWithUserData.sort((gigA, gigB) => gigB.createdAt - gigA.createdAt);
    }

    res.status(200).send(gigsWithUserData);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createGig,
  deleteGig,
  updateGig,
  getGig,
  getGigs,
};

