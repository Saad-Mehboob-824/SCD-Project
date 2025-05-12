const fetch = require("node-fetch");
require("dotenv").config();

// Controller to validate the shipping address
exports.validateAddress = async (req, res) => {
  try {
    const { street, city, state, postalCode, country } = req.body;

    const response = await fetch(
      "https://api.shipengine.com/v1/addresses/validate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "API-Key": process.env.SHIPENGINE_API_KEY,
        },
        body: JSON.stringify([
          {
            address_line1: street,
            city_locality: city,
            state_province: state,
            postal_code: postalCode,
            country_code: country,
          },
        ]),
      }
    );

    const data = await response.json();

    if (response.ok && data[0]?.status === "verified") {
      return res.status(200).json({
        message: "Address validated successfully",
        data: { status: "verified" },
      });
    }

    return res.status(400).json({
      message: "Address validation failed",
      errors: data[0]?.messages || ["Invalid address"],
    });
  } catch (error) {
    console.error("Address Validation Error:", error);
    return res.status(500).json({
      message: "Server error during address validation",
      errors: [error.message],
    });
  }
};

// Controller to calculate shipping cost
exports.calculateShippingCost = async (req, res) => {
  try {
    const { ship_to, packages } = req.body;

    // Get carrier IDs from ShipEngine account
    const carrierIds = process.env.SHIPENGINE_CARRIER_IDS
      ? process.env.SHIPENGINE_CARRIER_IDS.split(",")
      : [];

    if (carrierIds.length === 0) {
      return res.status(400).json({
        message: "No carrier IDs configured",
        errors: ["Please configure carrier IDs in your environment"],
      });
    }

    const shipEnginePayload = {
      rate_options: {
        carrier_ids: carrierIds, // Use configured carrier IDs
      },
      shipment: {
        validate_address: "no_validation",
        ship_to: {
          name: "Recipient", // Added default name
          phone: "555-123-4567", // Added default phone number
          company_name: "", // Optional
          address_line1: ship_to.street,
          city_locality: ship_to.city,
          state_province: ship_to.state,
          postal_code: ship_to.postalCode,
          country_code: ship_to.country,
          address_residential_indicator: "no",
        },
        ship_from: {
          name: "Sender",
          phone: "555-987-6543", // Added default phone number
          company_name: "", // Optional
          address_line1: "123 Warehouse St",
          city_locality: "New York",
          state_province: "NY",
          postal_code: "10001",
          country_code: "US",
          address_residential_indicator: "no",
        },
        packages: [
          {
            package_code: "package",
            weight: {
              value: packages[0].weight.value,
              unit: packages[0].weight.unit,
            },
            dimensions: {
              length: packages[0].dimensions.length,
              width: packages[0].dimensions.width,
              height: packages[0].dimensions.height,
              unit: packages[0].dimensions.unit,
            },
          },
        ],
      },
    };

    console.log(
      "ShipEngine Payload:",
      JSON.stringify(shipEnginePayload, null, 2)
    );

    const response = await fetch("https://api.shipengine.com/v1/rates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": process.env.SHIPENGINE_API_KEY,
      },
      body: JSON.stringify(shipEnginePayload),
    });

    const responseText = await response.text();
    console.log("ShipEngine Response Status:", response.status);
    console.log("ShipEngine Response Body:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON Parsing Error:", parseError);
      return res.status(500).json({
        message: "Error parsing ShipEngine response",
        errors: [parseError.message],
      });
    }

    if (response.ok && data.rate_response?.rates?.length > 0) {
      return res.status(200).json({
        message: "Shipping cost calculated successfully",
        shipping_amount: data.rate_response.rates[0].shipping_amount.amount,
      });
    }

    return res.status(400).json({
      message: "Failed to calculate shipping cost",
      errors: data.errors || ["Unable to calculate shipping rate"],
      rawResponse: data,
    });
  } catch (error) {
    console.error("Shipping Cost Calculation Full Error:", error);
    return res.status(500).json({
      message: "Server error during shipping cost calculation",
      errors: [error.message],
      fullError: error,
    });
  }
};
