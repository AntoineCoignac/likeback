const Order = require("../models/order.model.js");
const createError = require("../utils/createError.js");
const Gig = require("../models/gig.model.js");
const Stripe = require("stripe");
const moment = require("moment");
const User = require("../models/user.model.js");

const intent = async (req, res, next) => {
  try {
    
    const stripe = new Stripe(
      process.env.STRIPE
    );
  
    const gig = await Gig.findById(req.params.id)
  
    const paymentIntent = await stripe.paymentIntents.create({
      amount: gig.price * 100,
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
    });
  
    const newOrder = new Order({
        gigId : gig._id,
        img : gig.cover,
        title:gig.title,
        buyerId:req.userId,
        sellerId : gig.userId,
        price:gig.price,
        payment_intent:paymentIntent.id,
        remainingRevisions: gig.revisionNumber,
        deliveryTime : gig.deliveryTime
    });
  
    await newOrder.save();
  
    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (err) {
    next(err);
  }
  
}

const getOrders = async (req, res, next) => {
  try {
    
    // Utilisez req.userId pour récupérer les commandes pour l'utilisateur connecté
    const orders = await Order.find({
      ...(req.isSeller
        ? { $or: [{ sellerId: req.userId }, { buyerId: req.userId }] }
        : { buyerId: req.userId }),
      isCompleted: true,
    }).sort({ updatedAt: -1 }); // Triez par updatedAt de manière décroissante (la plus récente en premier)

    res.status(200).send(orders);
  } catch (err) {
    next(err);
  }
};


const likeOrder = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    
    // Vérifier si l'ID de commande est valide
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return next(createError(400, "ID de commande invalide"));
    }

    // Vérifier si la commande existe
    const order = await Order.findById(orderId);

    if (!order) {
      return next(createError(404, "Commande non trouvée"));
    }

    // Vérifier si l'utilisateur actuel est l'acheteur de la commande
    if (req.userId !== order.buyerId) {
      return next(
        createError(403, "Vous n'êtes pas autorisé à liker cette commande")
      );
    }

    // Vérifier si la commande est terminée (isFinished) pour permettre le like
    if (!order.isFinished) {
      return next(createError(400, "La commande doit être terminée pour être likée"));
    }

    // Vérifier si la commande a déjà été likée par l'acheteur
    if (order.isLiked === true) {
      return next(createError(400, "Vous avez déjà liké cette commande"));
    }

    // Mettre à jour la commande pour indiquer qu'elle a été likée
    order.isLiked = true;

    // Enregistrer la mise à jour dans la base de données
    await order.save();

    // Maintenant, mettons à jour le compteur de "like" du vendeur
    const seller = await User.findById(order.sellerId); // Supposons que le vendeur soit stocké dans la propriété "sellerId" de l'objet "Order".

    if (!seller) {
      // Gérer le cas où le vendeur n'existe pas (peut-être une erreur à gérer)
      return next(createError(404, "Vendeur non trouvé"));
    }

    // Incrémenter le compteur de "like" du vendeur
    seller.like += 1;

    // Enregistrer la mise à jour du vendeur dans la base de données
    await seller.save();

    res.status(200).send("Commande likée avec succès");
  } catch (err) {
    next(err);
  }
};


const confirm = async (req, res, next) => {
  try {
    
    const order = await Order.findOne({
      payment_intent: req.body.payment_intent,
    });

    if (!order) {
      return res.status(404).send("Order not found");
    }

    const updatedOrder = await Order.findOneAndUpdate(
      {
        payment_intent: req.body.payment_intent,
      },
      {
        $set:{
          isCompleted: true,
          brief: req.body.brief,
          deadline: moment().add(order.deliveryTime, 'days').toDate(),
        },
      },
      { new: true } // This option returns the updated document
    );

    res.status(200).send("Order has been confirmed.");
  } catch (err) {
    next(err);
  }
}

// Route pour récupérer une seule commande par son ID
const getOrderById = async (req, res, next) => {
  try {
    
    const orderId = req.params.id;

    // Vérifiez si orderId est un ID valide
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return next(createError(400, "ID de commande invalide"));
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return next(createError(404, "Commande non trouvée"));
    }

    res.status(200).send(order);
  } catch (err) {
    next(err);
  }
};


const accept = async (req, res, next) => {
  try {
    
    const orderId = req.params.id;
    const acceptedValue = req.body.acceptedBySeller;

    // Vérifiez si orderId est un ID valide
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return next(createError(400, "ID de commande invalide"));
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return next(createError(404, "Commande non trouvée"));
    }

    // Mettez à jour la propriété acceptedBySeller avec la valeur fournie
    order.acceptedBySeller = acceptedValue;

    await order.save();

    res.status(200).send("Statut de l'acceptation mis à jour avec succès.");
  } catch (err) {
    next(err);
  }
};


module.exports = {
  intent,
  getOrders,
  likeOrder,
  confirm,
  getOrderById,
  accept,
};

