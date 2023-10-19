const createError = require("../utils/createError.js");
const Delivery = require("../models/delivery.model.js");
const Order = require("../models/order.model.js");

export const createDelivery = async (req, res, next) => {
  const { orderId, docs } = req.body;

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

    // Vérifier si la commande est terminée
    if (!order.isCompleted) {
      return next(
        createError(
          400,
          "La commande doit être terminée pour ajouter une livraison"
        )
      );
    }

    // Vérifier si la commande est acceptée par le vendeur
    if (order.acceptedBySeller !== true) {
      return next(
        createError(
          400,
          "La commande doit être acceptée par le vendeur pour ajouter une livraison"
        )
      );
    }

    // Vérifier si l'utilisateur actuel est le vendeur de la commande
    if (req.userId !== order.sellerId) {
      return next(
        createError(
          403,
          "Vous n'êtes pas autorisé à ajouter une livraison pour cette commande"
        )
      );
    }

    // Vérifier si c'est la première livraison
    const existingDelivery = await Delivery.findOne({ orderId });

    // Vérifier si la commande est terminée (isFinished = true)
    if (order.isFinished) {
      return next(
        createError(
          400,
          "Vous ne pouvez pas ajouter de livraison à une commande déjà terminée"
        )
      );
    }

    // Vérifier si le nombre de remainingRevisions est supérieur à 0
    if (order.remainingRevisions <= 0) {
      return next(
        createError(
          400,
          "Vous ne pouvez pas ajouter de livraison, le nombre de révisions disponibles est épuisé"
        )
      );
    }

    // Vérifier si la dernière livraison a isValid différent de false
    if (existingDelivery && existingDelivery.isValid !== false) {
      return next(
        createError(
          400,
          "Vous ne pouvez pas ajouter de livraison tant que la dernière livraison n'a pas été refusée"
        )
      );
    }

    // Créer la livraison
    const newDelivery = new Delivery({
      orderId,
      docs,
    });

    // Enregistrer la livraison dans la base de données
    await newDelivery.save();

    // Mettre à jour le nombre de remainingRevisions uniquement si ce n'est pas la première livraison
    if (existingDelivery) {
      await Order.findByIdAndUpdate(orderId, {
        $inc: { remainingRevisions: -1 },
      });
    }

    res.status(201).send(newDelivery);
  } catch (err) {
    next(err);
  }
};

export const getDeliveriesByOrder = async (req, res, next) => {
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

    // Vérifier si l'utilisateur actuel est soit l'acheteur, soit le vendeur de la commande
    if (req.userId !== order.buyerId && req.userId !== order.sellerId) {
      return next(
        createError(403, "Vous n'êtes pas autorisé à accéder à ces livraisons")
      );
    }

    // Récupérer toutes les livraisons associées à la commande
    const deliveries = await Delivery.find({ orderId }).sort({ createdAt: -1 });

    res.status(200).send(deliveries);
  } catch (err) {
    next(err);
  }
};

export const acceptOrRejectDelivery = async (req, res, next) => {
  const { deliveryId } = req.params;
  const { validation, feedback } = req.body;
  console.log(validation);

  try {
    
    // Vérifier si l'ID de livraison est valide
    if (!deliveryId.match(/^[0-9a-fA-F]{24}$/)) {
      return next(createError(400, "ID de livraison invalide"));
    }

    // Vérifier si la livraison existe
    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      return next(createError(404, "Livraison non trouvée"));
    }

    // Récupérer l'ordre associé à la livraison en utilisant l'orderId
    const order = await Order.findById(delivery.orderId);

    // Vérifier si l'utilisateur actuel est l'acheteur de la commande associée
    if (req.userId !== order.buyerId) {
      return next(
        createError(403, "Vous n'êtes pas autorisé à effectuer cette validation")
      );
    }

    // Mettre à jour l'état de validation de la livraison en fonction de l'validation (accepter ou refuser)
    if (validation === "accept") {
      delivery.isValid = true;

      // Si la livraison est acceptée, mettez à jour l'ordre associé avec isFinished = true
      await Order.findByIdAndUpdate(delivery.orderId, { isFinished: true });
    } else if (validation === "reject") {
      delivery.isValid = false;
      // Mettez ici toute autre logique spécifique à l'validation "reject" si nécessaire
    } else {
      return next(createError(400, "validation invalide"));
    }


    // Ajouter le feedback à la livraison
    delivery.feedback = feedback;

    // Enregistrer la mise à jour dans la base de données
    await delivery.save();

    res.status(200).send("validation effectuée avec succès");
  } catch (err) {
    next(err);
  }
};
