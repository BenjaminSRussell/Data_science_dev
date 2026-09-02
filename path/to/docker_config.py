import os

# Check if the Docker daemon is running
def is_docker_running():
    return os.path.exists("//./pipe/dockerDesktopLinuxEngine")

# Example usage
if not is_docker_running():
    print("Docker is not running. Please start the Docker service.")
else:
    print("Docker is running.")