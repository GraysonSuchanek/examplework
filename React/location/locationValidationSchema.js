import * as Yup from "yup";

const locationValidationSchema = Yup.object().shape({
    locationTypeId: Yup.number()
        .required("Please choose a location type")
        .min(1, "Please choose a location type")
        .max(5, "Please choose a location type"),
    lineOne: Yup.string()
        .required("Please enter an address")
        .max(225, "Address too long"),
    lineTwo: Yup.string(),
    city: Yup.string()
        .required("Please enter a city"),
    zip: Yup.string()
        .required("Please enter a zip code")
        .length(5, "Please enter a valid zip code"),
    state: Yup.string()
        .required("Please choose a state")
        .min(2, "Please choose a state"),
  });

  export default locationValidationSchema;