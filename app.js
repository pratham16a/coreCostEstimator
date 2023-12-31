const bodyParser = require("body-parser");
const express = require("express");
const ejs = require("ejs");
const PORT = process.env.PORT;
const app = express();
const mongoose = require('mongoose');
const _ = require('lodash');

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.locals._ = _;
const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://pratham16a:Makunga98150@cluster0.ogn0vye.mongodb.net/AWWDB", {useNewUrlParser : true});
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

//---------------------------------------------------MongoDB Schemas and models
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
	typeOfWood : String
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

const NaggCollection = mongoose.model("Nagg", NaggSchema);
const ProductionDetailCollection = mongoose.model("ProductionDetail", ProductionReportSchema);
const HisaabCollection = mongoose.model("Hisaab", HisaabSchema);



//---------------------------------------------------global variables

var noOfRows_CoreProduction = 2;
var noOfVehicles = 2;
var aaratPercent = 0.04;
var hc = 0;
var faali = 0;
var priceOfFaali = 0.85;
var labour = 0.13;
var rullaPercent = 0.04;
var rullaPrice = 580;
var divisionFactor = 1.8;
var cd = 0.02;
var ksPercent = 0;
var ksPrice = 450;
var dPercent = 0;
var dPrice = 250;
var npWood = 0;
var npPrice = 900;

//------------------------------------------------------constructors
function ProductionDetail(length, breadth = 2, noOfBundles, extraPieces = 0){
	this.length = Number(length);
	if (breadth === '' || breadth === NaN){
		this.breadth = 2;
	} else {
		this.breadth = Number(breadth);
	}
	this.noOfBundles = Number(noOfBundles);
	if (noOfBundles === '' || noOfBundles === NaN){
		this.extraPieces = 0;
	} else {
		this.extraPieces = Number(extraPieces);
	}
	this.totalNoOfPieces = Number(this.noOfBundles * 25 + this.extraPieces);
	this.squareFeet = Number(this.length * this.breadth * this.totalNoOfPieces);
}

function NaggDetail(netWeight, kaat , mixFatti, priceMixFatti, priceWood, date, party, typeOfWood){
	this.netWeight = Number(netWeight);
	if (kaat === '' || kaat === "NaN"){
		this.kaat = 0;
	} else {
		this.kaat = Number(kaat);
	}
	if (mixFatti === '' || mixFatti === "NaN"){
		this.mixFatti = 0;
	} else {
		this.mixFatti = Number(mixFatti);
	}
	if (priceMixFatti === '' || priceMixFatti === "NaN"){
		this.priceMixFatti = 0;
	} else {
		this.priceMixFatti = Number(priceMixFatti);
	}
	this.priceWood = Number(priceWood);
	this.usableWood = Number(this.netWeight - this.kaat - this.mixFatti);
	const priceOfNaggWithoutAarat = Number(this.usableWood * this.priceWood + this.mixFatti * this.priceMixFatti);
	this.priceOfNagg = Number(priceOfNaggWithoutAarat + aaratPercent*priceOfNaggWithoutAarat);
	if (date == 'Invalid Date'){
		this.date = "NaN";
	} else {
		this.date = new Date(date);
		this.date = this.date.toLocaleDateString("en-US", {day : "numeric", month : "numeric", year : "numeric"});
	}
	this.party = String(party);
	this.party = _.kebabCase(this.party);
	this.typeOfWood = String(typeOfWood);
	this.typeOfWood = _.kebabCase(this.typeOfWood);
}

//---------------------------------------------------GETS
app.get("/", function(req, res){
	res.render("main");
});

app.get("/index", function(req, res){
	res.render("index");
});

app.get("/cpr", function(req, res){
	globalThis.hisaabInstance = new HisaabCollection;
	globalThis.productionDetailArray = []; //array of production details
	globalThis.naggDetailArray = []; //array of nagg details
	console.log("\n\nhisaab instance has been created\n\n");
	res.render("cpr", {
		noOfRows_CoreProduction : noOfRows_CoreProduction
	});
});

app.get("/vd", function(req, res){
	res.render("vd", {
		noOfVehicles : noOfVehicles
	});
});

app.get("/ov", function(req, res){
	res.render("ov");
});

app.get("/results", function(req, res){
	var totalCost = 0;
	var totalWeight = 0;
	var totalSquareFeet = 0;
	var productOfCostAndWeight = 0;
	naggDetailArray.forEach((item)=>{
		totalCost = item.priceOfNagg + totalCost;
		totalWeight = item.netWeight + totalWeight;
		productOfCostAndWeight = (item.priceWood * item.netWeight) + productOfCostAndWeight;
	});
	var weightedAvgCost = productOfCostAndWeight / totalWeight;
	weightedAvgCost = Math.round(weightedAvgCost*100)/100;
	totalWeight = totalWeight - npWood;
	totalWeight = Math.round(totalWeight*100)/100;

	productionDetailArray.forEach((item)=>{
		totalSquareFeet = item.squareFeet + totalSquareFeet;
	});

	totalSquareFeetWithHalfCut = Number(totalSquareFeet + hc * totalSquareFeet);
	var FaaliSqFeet = faali * totalSquareFeet;
	var costReductionFromFaali = FaaliSqFeet * priceOfFaali * divisionFactor;
	var costReductionFromKenchi = ksPercent * totalWeight * ksPrice;
	var costReductionFromDebarker = dPercent * totalWeight * dPrice;
	var costOfLabour = labour * (totalSquareFeetWithHalfCut + FaaliSqFeet);
	var costReductionFromRulla = rullaPercent * totalWeight * rullaPrice;
	var costReductionFromCD = totalCost * cd;
	var costReductionFromNPW = npPrice * npWood;

	var finalCost = totalCost - costReductionFromFaali - costReductionFromKenchi - costReductionFromDebarker - costReductionFromRulla - costReductionFromCD - costReductionFromNPW + costOfLabour;
	
	var squareFeetPerQuantal = totalSquareFeetWithHalfCut / totalWeight;
	squareFeetPerQuantal = Math.round(squareFeetPerQuantal*100)/100;
	var pricePerMM = finalCost / (totalSquareFeetWithHalfCut * divisionFactor);
	pricePerMM = Math.round(pricePerMM * 100)/100;

	hisaabInstance.totalCost = totalCost;
	hisaabInstance.totalWeight = totalWeight;
	hisaabInstance.sqftQ = squareFeetPerQuantal;
	hisaabInstance.pricePerMM = pricePerMM;
	hisaabInstance.weightedAvgCost = weightedAvgCost;
	hisaabInstance.hc = hc;
	hisaabInstance.faali = faali;
	hisaabInstance.priceOfFaali = priceOfFaali;
	hisaabInstance.labour = labour;
	hisaabInstance.rullaPercent = rullaPercent;
	hisaabInstance.rullaPrice = rullaPrice;
	hisaabInstance.divisionFactor = divisionFactor;
	hisaabInstance.cd = cd;
	hisaabInstance.ksPercent = ksPercent;
	hisaabInstance.ksPrice = ksPrice;
	hisaabInstance.dPercent = dPercent;
	hisaabInstance.dPrice = dPrice;
	hisaabInstance.npWood = npWood;
	hisaabInstance.npPrice = npPrice;
	hisaabInstance.aarat = aaratPercent;
	hisaabInstance.dateOfRecording = new Date();
	hisaabInstance.dateOfRecording = hisaabInstance.dateOfRecording.toLocaleDateString("en-US", {day : "numeric", month : "numeric", year : "numeric"});
	;

	console.log("\n\nAdded to hisaab collection\n\n");
	

	console.log("sq ft / quantal " + squareFeetPerQuantal);
	console.log("price per mm " + pricePerMM);
	console.log("total Cost" + totalCost);
	res.render("results", {
		totalCost : totalCost,
		totalWeight : totalWeight,
		sqftQ : squareFeetPerQuantal,
		pricePerMM : pricePerMM,
		weightedAvgCost : weightedAvgCost
	});
});

app.get("/db", function(req, res){
	var docToSend = [];
	HisaabCollection.find({}).then(foundItems =>{
		console.log(foundItems);
		res.render("db", {
			docToSend : foundItems
		});
	});
});

app.get("/expand", function(req, res){
	HisaabCollection.findOne({_id : expansionObjectId}).then(foundItems => {
		console.log(foundItems.naggs);
		console.log(foundItems.productionReport);
		res.render("expand", {
			naggsArray : foundItems.naggs,
			productionReportArray : foundItems.productionReport,
			aarat:foundItems.aarat ,
			cd:foundItems.cd ,
			dPercent:foundItems.dPercent ,
			dPrice:foundItems.dPrice ,
			dateOfRecording:foundItems.dateOfRecording ,
			divisionFactor:foundItems.divisionFactor ,
			faali:foundItems.faali ,
			hc:foundItems.hc ,
			ksPercent:foundItems.ksPercent ,
			ksPrice:foundItems.ksPrice ,
			labour:foundItems.labour ,
			npPrice:foundItems.npPrice ,
			npWood:foundItems.npWood ,
			priceOfFaali:foundItems.priceOfFaali ,
			pricePerMM:foundItems.pricePerMM ,
			rullaPercent:foundItems.rullaPercent ,
			sqftQ:foundItems.sqftQ ,
			totalCost:foundItems.totalCost ,
			totalWeight:foundItems.totalWeight ,
			weightedAvgCost:foundItems.weightedAvgCost ,
			rullaPrice:foundItems.rullaPrice ,
		});
	})
});
//-------------------------------------------------POSTS
app.post("/", function(req, res){
	res.redirect("/index");
});
app.post("/db", function(req, res){
	res.redirect("/db");
});
app.post("/index", function(req, res){
	noOfRows_CoreProduction = req.body.noOfRows_CoreProduction;
	noOfVehicles = req.body.noOfVehicles;
	console.log(noOfRows_CoreProduction, noOfVehicles);
	res.redirect("/cpr");
});
app.post("/cpr", function(req, res){
	separatingReceivedArraysPR(req.body.lengthX, req.body.breadthX, req.body.noOfBundlesX, req.body.extraPiecesX);
	console.log(productionDetailArray);
	res.redirect("/vd");
});

app.post("/vd", function(req, res){
	separatingReceivedArraysVD(req.body.netWeightX, req.body.kaatX, req.body.millX, req.body.priceOfMixFattiX, req.body.priceOfWoodX, req.body.dateX, req.body.partyX, req.body.typeOfWoodX);
	console.log(naggDetailArray);
	res.redirect("/ov");
});

app.post("/ov", function(req, res){
	aaratPercent = Number(req.body.Aarat/100);
	hc = Number(req.body.hc/100);
	faali = Number(req.body.faali/100);
	priceOfFaali = Number(req.body.priceOfFaali);
	labour= Number(req.body.labour/100);
	rullaPercent= Number(req.body.rullaPercent/100);
	rullaPrice = Number(req.body.rullaPrice);
	divisionFactor = Number(req.body.divisionFactor);
	cd = Number(req.body.cd/100);
	ksPercent = Number(req.body.ksPercent/100);
	ksPrice = Number(req.body.ksPrice);
	dPercent = Number(req.body.dPercent/100);
	dPrice = Number(req.body.dPrice);
	npWood = Number(req.body.npWood);
	npPrice = Number(req.body.npPrice);

	console.log(aaratPercent, hc, faali, priceOfFaali, labour, rullaPercent, rullaPrice, divisionFactor, cd, ksPercent, ksPrice, dPercent, dPrice, npWood, npPrice);

	res.redirect("/results");
});

app.post("/deleteX", function(req, res){
	const objectId = req.body.deleteEntryId;
	deleteHisaabEntry(objectId);
	res.redirect("/db");
});

async function deleteHisaabEntry(objectId){
	await HisaabCollection.deleteOne({_id : objectId});
}

app.post("/expandX", function(req, res){
	globalThis.expansionObjectId = req.body.expandEntryId;
	res.redirect("/expand");
});

app.post("/goHome", function(req, res){
	if (String(req.body.saveToDB) == "on"){
		hisaabInstance.save();
	}
	res.redirect("/")
});

app.post("/deleteAll", function(req, res){
	deleteAllHisaabs();
	res.redirect("/db")
});

async function deleteAllHisaabs(){
	await HisaabCollection.deleteMany({});
}



//----------------------------------------------------------custom functions
function separatingReceivedArraysPR (l, b, bu, pi) {

	if (noOfRows_CoreProduction == 1){
		var tempDoc = new ProductionDetail(l, b, bu, pi);
		const productionDetail = new ProductionDetailCollection({
			length : tempDoc.length,
			breadth : tempDoc.breadth,
			noOfBundles : tempDoc.noOfBundles,
			extraPieces : tempDoc.extraPieces,
			totalNoOfPieces : tempDoc.totalNoOfPieces,
			squareFeet : tempDoc.squareFeet
		});
		// productionDetail.save();
		hisaabInstance.productionReport.push(productionDetail);
		console.log("\n\nSaved to ProductionDetailCollection\n\n");
		productionDetailArray.push(tempDoc);
	} else {
		for (i = 0; i < l.length; i++){
			var tempDoc = new ProductionDetail(l[i], b[i], bu[i], pi[i]);
			const productionDetail = new ProductionDetailCollection({
				length : tempDoc.length,
				breadth : tempDoc.breadth,
				noOfBundles : tempDoc.noOfBundles,
				extraPieces : tempDoc.extraPieces,
				totalNoOfPieces : tempDoc.totalNoOfPieces,
				squareFeet : tempDoc.squareFeet
			});
			// productionDetail.save();
			hisaabInstance.productionReport.push(productionDetail);
			console.log("\n\nSaved to ProductionDetailCollection\n\n");
			productionDetailArray.push(tempDoc);
	}

	
	}
	;
}

function separatingReceivedArraysVD (nw, k, m, pmf, pw, date, party, typeOfWood) {

	if (noOfVehicles == 1){
		var tempDoc = new NaggDetail(nw, k, m, pmf, pw, date, party, typeOfWood);
		const naggDetail = new NaggCollection({
			netWeight : tempDoc.netWeight, 
			kaat : tempDoc.kaat,
			mixFatti : tempDoc.mixFatti,
			priceMixFatti : tempDoc.priceMixFatti,
			priceWood : tempDoc.priceWood,
			usableWood : tempDoc.usableWood,
			priceOfNagg : tempDoc.priceOfNagg,
			date : tempDoc.date,
			party : _.kebabCase(tempDoc.party),
			typeOfWood : _.kebabCase(tempDoc.typeOfWood)
		});
		// naggDetail.save();
		hisaabInstance.naggs.push(naggDetail);
		console.log("\n\nDoc saved to nagg collection\n\n");
		naggDetailArray.push(tempDoc);
	} else {
		for (i = 0; i < nw.length; i++){
			var tempDoc = new NaggDetail(Number(nw[i]), Number(k[i]), Number(m[i]), Number(pmf[i]), Number(pw[i]), String(date[i]), String(party[i]), String(typeOfWood[i]));
			const naggDetail = new NaggCollection({
				netWeight : tempDoc.netWeight, 
				kaat : tempDoc.kaat,
				mixFatti : tempDoc.mixFatti,
				priceMixFatti : tempDoc.priceMixFatti,
				priceWood : tempDoc.priceWood,
				usableWood : tempDoc.usableWood,
				priceOfNagg : tempDoc.priceOfNagg,
				date : _.kebabCase(tempDoc.date),
				party : _.kebabCase(tempDoc.party),
				typeOfWood : tempDoc.typeOfWood
			});
			// naggDetail.save();
			hisaabInstance.naggs.push(naggDetail);
			console.log("\n\nDoc saved to nagg collection\n\n");
			naggDetailArray.push(tempDoc);
		}
	}

	;
	
}

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("listening for requests");
    })
})

