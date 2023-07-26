const NaggSchema = new mongoose.Schema({
	netWeight : Number, 
	kaat : Number, 
	mixFatti : Number,
	priceMixFatti : Number,
	priceWood : Number,
	usableWood : Number,
	priceOfNagg : Number,
	date : Date,
	party : String,
});

const ProductionReportSchema = new mongoose.Schema({
	length : Number,
	breadth : Number,
	noOfBundles : Number,
	extraPieces : Number,
	totalNoOfPieces : Number,
	squareFeet : Number
});

const HisaabSchema = new mongoose.Schema({
	naggs : [NaggSchema],
	productionReport : [ProductionReportSchema],
	totalCost : Number,
	totalWeight : Number,
	sqftQ : Number,
	pricePerMM : Number,
	weightedAvgCost : Number,
	hc : Number,
	faali : Number,
	priceOfFaali : Number,
	labour : Number,
	rullaPercent : Number,
	rullaPrice : Number,
	divisionFactor : Number,
	cd : Number,
	ksPercent : Number,
	ksPrice : Number,
	dPercent : Number,
	dPrice : Number,
	npWood : Number,
	npPrice : Number,
	aarat : Number,
	dateOfRecording : Date

});

this.dateOfRecording = new Date();
	this.dateOfRecording = this.dateOfRecording.toLocaleDateString("en-US", {day : "numeric", month : "numeric", year : "numeric"});