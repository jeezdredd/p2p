from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification


def send_notification(user, notification_type, title, message, link=''):
    notification = Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        link=link
    )

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'notifications_{user.id}',
        {
            'type': 'notification_message',
            'notification': {
                'id': notification.id,
                'type': notification_type,
                'title': title,
                'message': message,
                'link': link,
                'created_at': notification.created_at.isoformat()
            }
        }
    )

    return notification
