from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import HighScore

# Create your views here.

def index(request):
    high_scores = HighScore.objects.all()[:10]  # En yüksek 10 skoru al
    return render(request, 'game/index.html', {'high_scores': high_scores})

@csrf_exempt
@require_http_methods(["POST"])
def save_score(request):
    try:
        data = json.loads(request.body)
        player_name = data.get('player_name', 'Anonim')
        score = data.get('score', 0)
        difficulty = data.get('difficulty', 'medium')

        # Yeni yüksek skoru kaydet
        high_score = HighScore(
            player_name=player_name,
            score=score,
            difficulty=difficulty
        )
        high_score.save()

        # En yüksek 10 skoru döndür
        top_scores = HighScore.objects.all()[:10]
        scores_list = [{
            'player_name': score.player_name,
            'score': score.score,
            'difficulty': score.difficulty,
            'date': score.date.strftime('%d/%m/%Y %H:%M')
        } for score in top_scores]

        return JsonResponse({
            'success': True,
            'message': 'Skor başarıyla kaydedildi',
            'top_scores': scores_list
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=400)

@require_http_methods(["GET"])
def get_high_scores(request):
    difficulty = request.GET.get('difficulty', 'all')
    if difficulty != 'all':
        scores = HighScore.objects.filter(difficulty=difficulty)[:10]
    else:
        scores = HighScore.objects.all()[:10]

    scores_list = [{
        'player_name': score.player_name,
        'score': score.score,
        'difficulty': score.difficulty,
        'date': score.date.strftime('%d/%m/%Y %H:%M')
    } for score in scores]

    return JsonResponse({
        'success': True,
        'scores': scores_list
    })
