from django.db import models

# Create your models here.

class HighScore(models.Model):
    player_name = models.CharField(max_length=50)
    score = models.IntegerField()
    difficulty = models.CharField(max_length=10)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score', '-date']

    def __str__(self):
        return f"{self.player_name} - {self.score} ({self.difficulty})"
