# app/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import HistoriqueAction
from .serializers import HistoriqueActionSerializer
from drf_yasg.utils import swagger_auto_schema
from app.utils import enregistrer_action
from django.utils import timezone
from datetime import timedelta
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm, mm
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from datetime import datetime
import os
from django.conf import settings
from rest_framework.decorators import api_view
from projets.models import Magasin, Produit,StockItem, Projet
from mouvements.models import Entree, Sortie


@swagger_auto_schema(
    method='get',
    operation_description="Récupérer l'historique des actions de l'utilisateur connecté, en passant le token de l'utilisateur dans les en-têtes." \
    " Optionnellement, filtrer par période ('jour', 'semaine', 'mois', 'total').",
    responses={200: HistoriqueActionSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def historique_utilisateur(request, periode=None):
    user = request.user
    user_id = user.id
    now = timezone.now()
    if periode == 'jour':
        start_date = now - timedelta(days=1)
        historiques = HistoriqueAction.objects.filter(user_id=user_id, date_action__gte=start_date).order_by('-date_action')
    elif periode == 'semaine':
        start_date = now - timedelta(weeks=1)
        historiques = HistoriqueAction.objects.filter(user_id=user_id, date_action__gte=start_date).order_by('-date_action')
    elif periode == 'mois':
        start_date = now - timedelta(days=30)
        historiques = HistoriqueAction.objects.filter(user_id=user_id, date_action__gte=start_date).order_by('-date_action')
    else:
        historiques = HistoriqueAction.objects.filter(user_id=user_id).order_by('-date_action')

    # enregistrer_action(user, 'consultation', 'A consulter son historique', f"Liste des historiques.")
    serializer = HistoriqueActionSerializer(historiques, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@swagger_auto_schema(
    method='get',
    operation_description="Récupérer l'historique des actions de tous les utilisateurs dans le système.",
    responses={200: HistoriqueActionSerializer(many=True), 404: 'Not Found'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def historique_toutes_actions(request):
    historiques = HistoriqueAction.objects.all().order_by('-date_action')
    # enregistrer_action(request.user, 'consultation', 'A consulté la liste de tous les historiques', f"Liste de tous les historiques.")
    serializer = HistoriqueActionSerializer(historiques, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

#Ici pour la genereraton des rapoorts 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generer_rapport_stocks_pdf(request, projet_id):
    user = request.user
    if user.profil.libelle not in ['dg', 'dga', 'chef_appro', 'dt', 'chef_projet']:
        return Response({'error': "Vous n'avez pas le niveau d'habilitation nécessaire pour générer ce rapport."}, status=status.HTTP_403_FORBIDDEN)
    try:
        date_debut = request.GET.get('date_debut')
        date_fin = request.GET.get('date_fin')
        
        # Convertir les dates
        date_debut_obj = datetime.strptime(date_debut, '%Y-%m-%d') if date_debut else None
        date_fin_obj = datetime.strptime(date_fin, '%Y-%m-%d') if date_fin else None

        try:
            projet = Projet.objects.get(pk=projet_id)
        except Projet.DoesNotExist:
            return Response({'error': 'Projet introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    
        try:
            magasin = Magasin.objects.get(projet=projet)
        except Magasin.DoesNotExist:
            return Response({'error': 'Magasin introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        
        
        
        # Chemin du logo
        logo_path = os.path.join(settings.BASE_DIR, "static/images/logo_eebtp_fond_blanc.jpg")

        # Réponse HTTP en PDF
        response = HttpResponse(content_type="application/pdf")
        filename = f"rapport_stocks_{magasin.nom}_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        # Création du PDF  
        p = canvas.Canvas(response, pagesize=A4)
        largeur, hauteur = A4
        
        # Variables de position
        y_position = hauteur - 2 * cm
        
        def dessiner_en_tete():
            """Dessine l'en-tête du rapport"""
            nonlocal y_position
            
            # Logo
            p.drawImage(logo_path,
                x=largeur/2 - 2*cm, y=y_position - 2*cm,
                width=4*cm, height=4*cm,
                preserveAspectRatio=True,
                mask='auto'
            )
            
            y_position -= 5 * cm
            
            # Informations du rapport
            p.setFont("Helvetica-Bold", 14)
            p.drawString(2 * cm, y_position, f"Magasin: {magasin.nom}")
            p.drawString(2 * cm, y_position - 0.6*cm, f"Emplacement: {magasin.adresse}")
            
            p.setFont("Helvetica", 10)
            if date_debut_obj and date_fin_obj:
                p.drawString(2 * cm, y_position - 1.2*cm, f"Période: du {date_debut_obj.strftime('%d/%m/%Y')} au {date_fin_obj.strftime('%d/%m/%Y')}")
            
            p.drawString(2 * cm, y_position - 1.8*cm, f"Généré le: {datetime.now().strftime('%d/%m/%Y à %H:%M')}")
            
            # Titre du rapport
            p.setFont("Helvetica-Bold", 16)
            p.drawString(2 * cm, y_position - 3*cm, "RAPPORT DES MOUVEMENTS DE STOCKS PAR ARTICLE")
            
            y_position -= 4 * cm
        
        def nouvelle_page():
            """Crée une nouvelle page"""
            p.showPage()
            return hauteur - 2 * cm
        
        def calculer_hauteur_tableau(data, ligne_hauteur=0.6*cm):
            """Calcule la hauteur réelle d'un tableau"""
            return len(data) * ligne_hauteur
        
        # Dessiner l'en-tête initial
        dessiner_en_tete()
        
        # Récupérer tous les produits du magasin
        stock_items = StockItem.objects.filter(magasin=magasin, is_active=True)
        
        for stock_item in stock_items:
            # Vérifier s'il faut créer une nouvelle page
            if y_position < 15 * cm:
                y_position = nouvelle_page()
                # Redessiner l'en-tête sur les nouvelles pages si nécessaire
                p.setFont("Helvetica-Bold", 12)
                p.drawString(2 * cm, y_position, f"ARTICLE: {stock_item.produit.designation}")
                p.setFont("Helvetica", 10)
                p.drawString(2 * cm, y_position - 0.5*cm, f"Unité: {stock_item.produit.unite}")
                y_position -= 1.5 * cm
            
            else:
                # Titre de l'article
                p.setFont("Helvetica-Bold", 12)
                p.drawString(2 * cm, y_position, f"ARTICLE: {stock_item.produit.designation}")
                p.setFont("Helvetica", 10)
                p.drawString(2 * cm, y_position - 0.5*cm, f"Unité: {stock_item.produit.unite}")
                y_position -= 1.5 * cm
            
            # Récupérer les entrées
            entrees = Entree.objects.filter(
                magasin=magasin, 
                stock_item=stock_item,
                is_active=True
            )
            if date_debut_obj and date_fin_obj:
                entrees = entrees.filter(
                    date_creation__date__gte=date_debut_obj.date(),
                    date_creation__date__lte=date_fin_obj.date()
                )
            
            # Récupérer les sorties
            sorties = Sortie.objects.filter(
                magasin=magasin,
                stock_item=stock_item,
                is_active=True
            )
            if date_debut_obj and date_fin_obj:
                sorties = sorties.filter(
                    date_creation__date__gte=date_debut_obj.date(),
                    date_creation__date__lte=date_fin_obj.date()
                )
            
            # Tableau des ENTREES
            data_entrees = [
                ["ENTREES", "", "", ""],
                ["Date et heure", "Source", "Fait par", f"Quantité ({stock_item.produit.unite})"]
            ]
            
            total_entrees = 0
            for entree in entrees:
                # Déterminer la source
                if entree.demande_source:
                    source = f"Demande N°{entree.demande_source.number}"
                elif entree.source:
                    source = f"Sortie N°{entree.source.id}"
                elif entree.nom_livreur:
                    source = f"Livraison - {entree.nom_livreur}"
                else:
                    source = "Autre"
                
                data_entrees.append([
                    entree.date_creation.strftime('%d-%m-%Y à %Hh%M'),
                    source,
                    entree.make_by.get_full_name() if entree.make_by else "N/A",
                    f"{entree.quantite_m}"
                ])
                total_entrees += float(entree.quantite_m)
            
            # Ajouter le total des entrées
            data_entrees.append(["", "", "> TOTAL ENTREES:", f"> {total_entrees} {stock_item.produit.unite}"])
            
            # Créer le tableau des entrées
            table_entrees = Table(data_entrees, colWidths=[4.5*cm, 4.5*cm, 4.5*cm, 4.5*cm])
            table_entrees.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightblue),
                ("BACKGROUND", (0, 1), (-1, 1), colors.lightgrey),
                ("SPAN", (0, 0), (-1, 0)),  # Fusionner la ligne "ENTREES"
                ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                ("ALIGN", (3, 2), (-1, -1), "RIGHT"),
                ("GRID", (0, 1), (-1, -2), 1, colors.black),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("BACKGROUND", (0, -1), (-1, -1), colors.whitesmoke),
                ("ALIGN", (0, -1), (-1, -1), "RIGHT"),
            ]))
            
            # Calculer la hauteur réelle du tableau des entrées
            hauteur_entrees = calculer_hauteur_tableau(data_entrees)
            
            # Vérifier l'espace pour le tableau des entrées
            if y_position - hauteur_entrees < 10 * cm:
                y_position = nouvelle_page()
                p.setFont("Helvetica-Bold", 12)
                p.drawString(2 * cm, y_position, f"ARTICLE: {stock_item.produit.designation} (suite)")
                y_position -= 1.5 * cm
            
            # Dessiner le tableau des entrées
            table_entrees.wrapOn(p, largeur, hauteur)
            table_entrees.drawOn(p, 2 * cm, y_position - hauteur_entrees)
            
            # ESPACEMENT UNIFORME - Réduit considérablement
            y_position -= hauteur_entrees + 0.3 * cm  # Seulement 0.3cm d'espace
            
            # Tableau des SORTIES
            data_sorties = [
                ["SORTIES", "", "", ""],
                ["Date et heure", "Objet de la sortie", "Fait par", f"Quantité ({stock_item.produit.unite})"]
            ]
            
            total_sorties = 0
            for sortie in sorties:
                data_sorties.append([
                    sortie.date_creation.strftime('%d-%m-%Y à %Hh%M'),
                    sortie.objet[:30] + "..." if len(sortie.objet) > 30 else sortie.objet,
                    sortie.make_by.get_full_name() if sortie.make_by else "N/A",
                    f"{sortie.quantite_m}"
                ])
                total_sorties += float(sortie.quantite_m)
            
            # Ajouter les totaux
            quantite_actuelle = float(stock_item.quantite)
            data_sorties.append(["", "", "TOTAL SORTIES:", f"{total_sorties} {stock_item.produit.unite}"])
            data_sorties.append(["", "", "Quantité actuelle:", f"{quantite_actuelle} {stock_item.produit.unite}"])
            
            # Créer le tableau des sorties
            table_sorties = Table(data_sorties, colWidths=[4.5*cm, 4.5*cm, 4.5*cm, 4.5*cm])
            table_sorties.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightcoral),
                ("BACKGROUND", (0, 1), (-1, 1), colors.lightgrey),
                ("SPAN", (0, 0), (-1, 0)),  # Fusionner la ligne "SORTIES"
                ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                ("ALIGN", (3, 2), (-1, -1), "RIGHT"),
                ("GRID", (0, 1), (-1, -3), 1, colors.black),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("BACKGROUND", (0, -2), (-1, -1), colors.whitesmoke),
                ("ALIGN", (0, -2), (-1, -1), "RIGHT"),
            ]))
            
            # Calculer la hauteur réelle du tableau des sorties
            hauteur_sorties = calculer_hauteur_tableau(data_sorties)
            
            # Vérifier l'espace pour le tableau des sorties
            if y_position - hauteur_sorties < 5 * cm:
                y_position = nouvelle_page()
                p.setFont("Helvetica-Bold", 12)
                p.drawString(2 * cm, y_position, f"ARTICLE: {stock_item.produit.designation} (suite)")
                y_position -= 1.5 * cm
            
            # Dessiner le tableau des sorties
            table_sorties.wrapOn(p, largeur, hauteur)
            table_sorties.drawOn(p, 2 * cm, y_position - hauteur_sorties)
            
            # ESPACEMENT UNIFORME entre les articles - Ligne de séparation fine
            y_position -= hauteur_sorties + 0.5 * cm
            
            # Ligne de séparation fine entre les articles
            if y_position > 3 * cm:
                p.setStrokeColor(colors.grey)
                p.setLineWidth(0.5)
                p.line(2 * cm, y_position + 0.2 * cm, largeur - 2 * cm, y_position + 0.2 * cm)
                p.setStrokeColor(colors.black)
                p.setLineWidth(1)
                y_position -= 0.8 * cm
        
        p.showPage()
        p.save()

        return response

    except Magasin.DoesNotExist:
        return HttpResponse("Magasin introuvable", status=404)
    except Exception as e:
        return HttpResponse(f"Erreur lors de la génération du rapport: {str(e)}", status=500)