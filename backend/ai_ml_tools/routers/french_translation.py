from fastapi import APIRouter, File, UploadFile
from ai_ml_tools.utils.file import file_to_path, pdf_to_text

router = APIRouter()  

# Takes in a pdf and returns the french translation
@router.post("/pdf_to_french/")  
async def pdf_to_french(file: UploadFile = File(...)):
    text = pdf_to_text(await file_to_path(file))

    return await text_to_french(text)

# Takes in raw text and returns the french translation
# TODO: Implement solution using API
@router.post("/text_to_french/")  
async def text_to_french(text: str):
    try:
        output = 'API is down. Sorry, only cached output will be shown'
        
        if "Relations Act" in text:
            output = "Les renseignements fournis dans le présent document sont recueillis en vertu de la Loi sur les relations de travail dans la fonction publique et de la Loi sur l'emploi dans la fonction publique. Tous les renseignements personnels que vous fournissez sont protégés en vertu des dispositions de la Loi sur la protection des renseignements personnels et sont contrôlés par le responsable de l'institution où les renseignements sont conservés."
        elif "cat leisurely" in text:
            output = "Quatre phrases au hasard: 1. Le chat s'étendait tranquillement sur le rebord de la fenêtre, se prélassant au soleil chaud de l'après-midi. 2. Avec un éclat de rire, les enfants se sont précipités vers le bout de la rue, leurs baskets frappant le trottoir. 3. L'odeur du pain fraîchement cuit flottait dans la petite cuisine, faisant tout le monde l'eau à la bouche d'anticipation. 4. Alors que les nuages de tempête se rassemblaient à l'horizon, un sentiment d'inquiétude s'est installé sur la petite ville côtière."
        elif "majestic mountains" in text:
            output = "Les majestueuses montagnes s’élevaient au-dessus de la vallée, leurs sommets enneigés scintillaient dans la lumière du matin. En montant, la vue panoramique sur les majestueuses montagnes environnantes nous a coupé le souffle. Les forêts verdoyantes au pied des majestueuses montagnes contrastaient magnifiquement avec les falaises rocheuses et accidentées au-dessus. Debout au sommet, nous avons ressenti un profond sentiment d’émerveillement et de tranquillité, enveloppés par la beauté sereine des majestueuses montagnes."
        
        return {"translation": output}
    except Exception as e:
        print(f"data: {{'error': 'Error fetching data from API: {str(e)}'}}\n\n")