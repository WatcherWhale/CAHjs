window.onload = function()
{
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.googletagmanager.com/gtag/js?id=%TRACKCODE%';
    
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];

    gtag('js', new Date());
    gtag('config', '%TRACKCODE%');
};

function gtag()
{
    dataLayer.push(arguments);
}