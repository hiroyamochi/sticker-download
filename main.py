import sys
import re
import requests
import configparser
import os

# Read config file
config = configparser.ConfigParser()
config.read('config.ini')

# Get URL
url = input('Enter URL of LINE sticker: ')

# Check if the URL is correct
if not 'store.line.me' in url:
  print('正しいURLを入力してください')
  sys.exit()

# Get download directory
try:
    download_dir = config.get('DEFAULT', 'directory')
except configparser.NoOptionError:
    download_dir = input('Please enter the directory: ')

# Get sticker ID
id = re.search(r'product/(\d+)/', url).group(1)

# Get metadata URL
meta_url = f'http://dl.stickershop.line.naver.jp/products/0/0/1/{id}/android/productInfo.meta'

# Fetch metadata
response = requests.get(meta_url)

metadata = response.json()

# Get sticker IDs and title
sticker_ids = [sticker['id'] for sticker in metadata['stickers']]
sticker_title = metadata['title']['ja']

# Check directory name and create if not exists
sticker_title = re.sub(r'[<>:"/\\|?*]', '', sticker_title)

download_dir = f'{download_dir}/{sticker_title}'
os.makedirs(download_dir, exist_ok=True)

# Download stickers
for i in range(len(sticker_ids)):
  download_url = f'http://dl.stickershop.line.naver.jp/products/0/0/1/{id}/android/stickers/{sticker_ids[i]}.png'
  response = requests.get(download_url)
  with open(f'{download_dir}/{id}_{i:02}.png', 'wb') as f:
    f.write(response.content)

print('Download completed!')