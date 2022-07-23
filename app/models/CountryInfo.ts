import mongoose, { Schema } from 'mongoose';

const schema = new Schema(
  {
    /**Country ID */
    _id: { type: Schema.Types.String },
    /**Country Name */
    name: { type: Schema.Types.String },
  }
);
const name = 'countries_informations';

export default mongoose.models[name] || mongoose.model(name, schema, name);

