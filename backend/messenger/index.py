"""
API для работы с мессенджером
Обрабатывает запросы: регистрация, авторизация, получение чатов, отправка сообщений
"""

import json
import os
import psycopg2
from typing import Dict, Any, List, Optional
from datetime import datetime

def get_db_connection():
    dsn = os.environ['DATABASE_URL']
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action', '')
        body_data = json.loads(event.get('body', '{}')) if event.get('body') else {}
        
        if method == 'POST' and action == 'login':
            return login_user(body_data, headers)
        
        elif method == 'POST' and action == 'register':
            return register_user(body_data, headers)
        
        elif method == 'GET' and action == 'chats':
            user_id = query_params.get('user_id')
            return get_user_chats(user_id, headers)
        
        elif method == 'POST' and action == 'create_chat':
            return create_chat(body_data, headers)
        
        elif method == 'GET' and action == 'messages':
            chat_id = query_params.get('chat_id')
            return get_chat_messages(chat_id, headers)
        
        elif method == 'POST' and action == 'send_message':
            return send_message(body_data, headers)
        
        else:
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'status': 'ok', 'method': method, 'action': action}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def login_user(data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    username = data.get('username', '').strip()
    
    if not username:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Username required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT id, username FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    
    if not user:
        cur.execute("INSERT INTO users (username) VALUES (%s) RETURNING id, username", (username,))
        user = cur.fetchone()
        conn.commit()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'id': user[0], 'username': user[1]}),
        'isBase64Encoded': False
    }

def register_user(data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    return login_user(data, headers)

def get_user_chats(user_id: Optional[str], headers: Dict[str, str]) -> Dict[str, Any]:
    if not user_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'User ID required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT DISTINCT 
            c.id, 
            c.name, 
            c.chat_type,
            (SELECT message_text FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT TO_CHAR(created_at, 'HH24:MI') FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
            (SELECT COUNT(*) FROM messages m2 
             WHERE m2.chat_id = c.id 
             AND m2.user_id != %s 
             AND m2.status != 'read') as unread_count
        FROM chats c
        JOIN chat_members cm ON c.id = cm.chat_id
        WHERE cm.user_id = %s
        ORDER BY c.id DESC
    """, (user_id, user_id))
    
    chats = []
    for row in cur.fetchall():
        chats.append({
            'id': str(row[0]),
            'name': row[1],
            'type': row[2],
            'lastMessage': row[3] or 'Новый чат',
            'time': row[4] or '',
            'unread': row[5] or 0
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'chats': chats}),
        'isBase64Encoded': False
    }

def create_chat(data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    name = data.get('name', '').strip()
    chat_type = data.get('type', 'personal')
    user_id = data.get('user_id')
    
    if not name or not user_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Name and user_id required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        "INSERT INTO chats (name, chat_type, created_by) VALUES (%s, %s, %s) RETURNING id",
        (name, chat_type, user_id)
    )
    chat_id = cur.fetchone()[0]
    
    cur.execute(
        "INSERT INTO chat_members (chat_id, user_id, is_online) VALUES (%s, %s, true)",
        (chat_id, user_id)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': headers,
        'body': json.dumps({
            'id': str(chat_id),
            'name': name,
            'type': chat_type
        }),
        'isBase64Encoded': False
    }

def get_chat_messages(chat_id: Optional[str], headers: Dict[str, str]) -> Dict[str, Any]:
    if not chat_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Chat ID required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT 
            m.id,
            m.message_text,
            TO_CHAR(m.created_at, 'HH24:MI') as time,
            m.user_id,
            m.status,
            u.username
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.chat_id = %s
        ORDER BY m.created_at ASC
    """, (chat_id,))
    
    messages = []
    for row in cur.fetchall():
        messages.append({
            'id': str(row[0]),
            'text': row[1],
            'time': row[2],
            'userId': row[3],
            'status': row[4],
            'username': row[5]
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'messages': messages}),
        'isBase64Encoded': False
    }

def send_message(data: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    chat_id = data.get('chat_id')
    user_id = data.get('user_id')
    text = data.get('text', '').strip()
    
    if not chat_id or not user_id or not text:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'chat_id, user_id and text required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        INSERT INTO messages (chat_id, user_id, message_text, status)
        VALUES (%s, %s, %s, 'sent')
        RETURNING id, TO_CHAR(created_at, 'HH24:MI')
    """, (chat_id, user_id, text))
    
    result = cur.fetchone()
    message_id = result[0]
    message_time = result[1]
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': headers,
        'body': json.dumps({
            'id': str(message_id),
            'text': text,
            'time': message_time,
            'status': 'sent'
        }),
        'isBase64Encoded': False
    }