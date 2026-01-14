from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User, Subject
from apps.materials.models import StudyMaterial
from apps.tutoring.models import TutoringSession
from apps.forum.models import Discussion, Reply
from apps.support.models import SupportQuery


class Command(BaseCommand):
    help = 'Seed database with test data'

    def handle(self, *args, **options):
        self.stdout.write('Creating test data...')

        subjects = [
            Subject.objects.get_or_create(name='Mathematics', defaults={'description': 'Algebra, Calculus, Statistics'})[0],
            Subject.objects.get_or_create(name='Physics', defaults={'description': 'Mechanics, Thermodynamics, Optics'})[0],
            Subject.objects.get_or_create(name='Chemistry', defaults={'description': 'Organic, Inorganic, Physical Chemistry'})[0],
            Subject.objects.get_or_create(name='Computer Science', defaults={'description': 'Programming, Algorithms, Data Structures'})[0],
            Subject.objects.get_or_create(name='English', defaults={'description': 'Grammar, Literature, Writing'})[0],
            Subject.objects.get_or_create(name='Biology', defaults={'description': 'Cell Biology, Genetics, Ecology'})[0],
        ]
        self.stdout.write(f'Created {len(subjects)} subjects')

        tutor1, created = User.objects.get_or_create(
            username='john_tutor',
            defaults={
                'email': 'john@example.com',
                'first_name': 'John',
                'last_name': 'Smith',
                'role': 'tutor',
                'bio': 'Experienced math and physics tutor with 5 years of teaching experience.'
            }
        )
        if created:
            tutor1.set_password('TutorPass123!')
            tutor1.save()
            tutor1.subjects.add(subjects[0], subjects[1])

        tutor2, created = User.objects.get_or_create(
            username='sarah_tutor',
            defaults={
                'email': 'sarah@example.com',
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'role': 'tutor',
                'bio': 'Computer Science graduate, passionate about teaching programming.'
            }
        )
        if created:
            tutor2.set_password('TutorPass123!')
            tutor2.save()
            tutor2.subjects.add(subjects[3])

        student1, created = User.objects.get_or_create(
            username='mike_student',
            defaults={
                'email': 'mike@example.com',
                'first_name': 'Mike',
                'last_name': 'Brown',
                'role': 'student',
                'bio': 'First year engineering student.'
            }
        )
        if created:
            student1.set_password('StudentPass123!')
            student1.save()

        student2, created = User.objects.get_or_create(
            username='emma_student',
            defaults={
                'email': 'emma@example.com',
                'first_name': 'Emma',
                'last_name': 'Wilson',
                'role': 'student',
                'bio': 'Biology major, interested in genetics.'
            }
        )
        if created:
            student2.set_password('StudentPass123!')
            student2.save()

        self.stdout.write('Created users')

        materials_data = [
            {'author': tutor1, 'subject': subjects[0], 'title': 'Calculus Fundamentals', 'description': 'Complete guide to differential and integral calculus with examples.', 'link': 'https://example.com/calculus'},
            {'author': tutor1, 'subject': subjects[1], 'title': 'Physics Problem Set', 'description': 'Collection of 50 physics problems covering mechanics and thermodynamics.', 'link': 'https://example.com/physics'},
            {'author': tutor2, 'subject': subjects[3], 'title': 'Python Basics', 'description': 'Introduction to Python programming for beginners.', 'link': 'https://example.com/python'},
            {'author': tutor2, 'subject': subjects[3], 'title': 'Data Structures Guide', 'description': 'Comprehensive guide to arrays, linked lists, trees, and graphs.', 'link': 'https://example.com/ds'},
            {'author': student1, 'subject': subjects[0], 'title': 'My Math Notes', 'description': 'Personal notes from linear algebra course.', 'link': 'https://example.com/notes'},
        ]

        for m in materials_data:
            StudyMaterial.objects.get_or_create(title=m['title'], defaults=m)
        self.stdout.write('Created study materials')

        today = timezone.now().date()
        sessions_data = [
            {'tutor': tutor1, 'student': student1, 'subject': subjects[0], 'title': 'Calculus Help Session', 'date': today + timedelta(days=1), 'time': '14:00', 'status': 'scheduled'},
            {'tutor': tutor1, 'student': student2, 'subject': subjects[1], 'title': 'Physics Exam Prep', 'date': today + timedelta(days=2), 'time': '10:00', 'status': 'scheduled'},
            {'tutor': tutor2, 'student': student1, 'subject': subjects[3], 'title': 'Python Programming', 'date': today + timedelta(days=3), 'time': '16:00', 'status': 'scheduled'},
            {'tutor': tutor1, 'student': student1, 'subject': subjects[0], 'title': 'Algebra Review', 'date': today - timedelta(days=5), 'time': '14:00', 'status': 'completed', 'notes': 'Great progress!'},
            {'tutor': tutor2, 'student': student2, 'subject': subjects[3], 'title': 'Intro to Coding', 'date': today - timedelta(days=3), 'time': '11:00', 'status': 'completed', 'notes': 'Covered basics.'},
        ]

        for s in sessions_data:
            TutoringSession.objects.get_or_create(title=s['title'], date=s['date'], defaults=s)
        self.stdout.write('Created tutoring sessions')

        disc1, created = Discussion.objects.get_or_create(
            title='How to solve differential equations?',
            defaults={'author': student1, 'subject': subjects[0], 'content': 'I am struggling with second-order differential equations. Can someone help?'}
        )
        if created:
            r1 = Reply.objects.create(discussion=disc1, author=tutor1, content='For second-order DEs, identify if homogeneous or not, then use characteristic equation.')
            Reply.objects.create(discussion=disc1, author=student2, content='This video helped me: https://example.com/tutorial')

        disc2, created = Discussion.objects.get_or_create(
            title='Best resources for learning Python?',
            defaults={'author': student2, 'subject': subjects[3], 'content': 'What are the best free resources to learn Python from scratch?'}
        )
        if created:
            Reply.objects.create(discussion=disc2, author=tutor2, content='Start with Python.org tutorial, then Codecademy or freeCodeCamp.')

        Discussion.objects.get_or_create(
            title='Study group for Physics exam',
            defaults={'author': student1, 'subject': subjects[1], 'content': 'Anyone interested in forming a study group for the Physics midterm?'}
        )
        self.stdout.write('Created forum discussions')

        SupportQuery.objects.get_or_create(
            email='newuser@example.com',
            subject='How to become a tutor?',
            defaults={'name': 'Alex', 'message': 'What are the requirements for becoming a tutor on this platform?'}
        )
        self.stdout.write('Created support queries')

        self.stdout.write(self.style.SUCCESS('\nDatabase seeded successfully!'))
        self.stdout.write('\nTest accounts:')
        self.stdout.write('  Tutors: john_tutor / TutorPass123!, sarah_tutor / TutorPass123!')
        self.stdout.write('  Students: mike_student / StudentPass123!, emma_student / StudentPass123!')
