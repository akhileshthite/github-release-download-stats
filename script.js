async function getDownloadCounts (user, repo) {
  const url = `https://api.github.com/repos/${user}/${repo}/releases`
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`GitHub API returned status ${response.status}`)
    }
    const releases = await response.json()

    let totalDownloadCount = 0
    let latestDownloadCount = 0

    if (releases.length === 0) {
      return { total: 0, latest: 0, latestTag: 'No releases found' }
    }

    releases.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    const latestRelease = releases[0]

    for (const release of releases) {
      const assets = release.assets
      for (const asset of assets) {
        totalDownloadCount += asset.download_count
        if (release.id === latestRelease.id) {
          latestDownloadCount += asset.download_count
        }
      }
    }

    return { total: totalDownloadCount, latest: latestDownloadCount, latestTag: latestRelease.tag_name }
  } catch (error) {
    throw error
  }
}

// Event listener for the form submission
document.getElementById('repoForm').addEventListener('submit', async (event) => {
  event.preventDefault()

  const user = document.getElementById('username').value.trim()
  const repo = document.getElementById('repository').value.trim()
  const outputDiv = document.getElementById('output')
  outputDiv.innerHTML = 'Fetching data...'

  try {
    const counts = await getDownloadCounts(user, repo)
    outputDiv.innerHTML = `
        <p><strong>Total download count for all releases:</strong> ${counts.total}</p>
        <p><strong>Download count for the latest release (${counts.latestTag}):</strong> ${counts.latest}</p>
      `
  } catch (error) {
    outputDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`
  }
})
