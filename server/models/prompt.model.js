import mongoose from "mongoose"

const promptSchema = new mongoose.Schema({

   investment: { type: Number },
   risk: { type: Number },
   tradeType: {
      type: String,
      required: true,
      enum: ['spot', 'future']
   },
   title: { type: String },
   content: { type: mongoose.Schema.Types.Mixed},

}, { timestamps: true });

const promptModel = mongoose.models.prompt || mongoose.model("prompt", promptSchema);

export default  promptModel

