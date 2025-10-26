# Layout customization

It is easy to customize the look of GoKabootar. Almost all functional components are encapsulated
in the upload- and download-app and they only need a root element where they can be mounted.
This elements must have the attribute `id="upload"` and `id="download"`, respectively.

GoKabootar uses [Bootstrap 3](http://getbootstrap.com/) as CSS-Framework and custom styles can
be found in [public/assets/styles.css](https://github.com/psi-4ward/GoKabootar/blob/master/public/assets/styles.css).

If you want to give GoKabootar your own custom look and feel just edit the files in `public/html` and/or
the `styles.css`. If you need to deliver assets like a custom logo put it into the `assets` folder.

But consider: You have to adopt further changes on GoKabootar updates. This sould not happen very often.

