# Trekking Management Application

Project for a Trekking Management Application 


## To Run the application follow these steps ##
## create virtual environment
"python -m venv .venv"
".venv/scripts/activate"

1) "pip install -r requirements.txt"

2) "cd Backend",
   "python seed.py"
   "python app.py" # To run the server 


3) ## To start Redis ##
* "sudo apt update"
* "sudo apt install redis-server -y"
To check running or not :-
redis-cli ping


4) ## To start Mailhog
* "cd ~"
* "wget https://github.com/mailhog/MailHog/releases/download/v1.0.1/MailHog_linux_amd64"
* "chmod +x MailHog_linux_amd64"
* "sudo mv MailHog_linux_amd64 /usr/local/bin/mailhog"
* "mailhog"

To see where running:-
Web UI: `http://localhost:8025`

5) ## To start celery worker
cd backend
celery -A celery_app.celery worker --loglevel=info --pool=solo

6) ## To start celery Beat 
cd backend
celery -A celery_app.celery beat --loglevel=info

7) ## For manual Trigger of scheduling 
cd backend
celery -A celery_app.celery call tasks.daily_reminder_job
celery -A celery_app.celery call tasks.monthly_report_job